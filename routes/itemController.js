const { NODE_ENV, GOOGLE_SEARCH_URL } = process.env;
const express = require('express');

const router = express.Router();
const uuid = require('uuid/v4');
const AWS = require('aws-sdk');
const request = require('request-promise-native');
const _ = require('lodash');
const DynamoDB = require('../src/DynamoDB');
const cache = require('../src/redis');



/**
 * Creates a new item which is slotted in a specific category
 */
router.post('/create', async (req, res) => {
  const ddb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
  if (!req.body.name || !req.body.quantity) {
    NODE_ENV !== 'test' && console.log(`[ERROR] Name or Quantity values missing from request body. Name = ${req.body.name} Quantity = ${req.body.quantity}`);
    res.json({ error: true, message: `Name or Quantity values missing from request body. Name = ${req.body.name} Quantity = ${req.body.quantity}` });
  }

  if (!req.body.category) {
    NODE_ENV !== 'test' && console.log(`[ERROR] Category value missing from request body. Category = ${req.body.category}`);
    res.json({ error: true, message: `Category value missing from request body. Category = ${req.body.category}` });
  }

  NODE_ENV !== 'test' && console.log(`[INFO] Attempting to create item ${req.body.name} for category ${req.body.category}`);
  const id = uuid().substring(10);
  const Item = {
    pid: req.body.category,
    sid: `item-${id}`,
    name: req.body.name,
    quantity: req.body.quantity,
  };
  const params = {
    TableName: 'inventory',
    Item,
  };

  try {
    await ddb.put(params).promise();
    res.json(Item);
  } catch (err) {
    NODE_ENV !== 'test' && console.log('[ERROR] POST -- /api/v1/item/create There was an error attempting to create a new item: ', req.body, err);
    res.status(500);
    res.json({ error: true, message: err.message });
  }
});

// TODO Remove this (security risk)
router.get('/flush', (req, res) => {
  cache.flushdb((err, succeeded) => {
    res.json(succeeded);
  });
});

/**
 * Finds all items & images for all categories and retrieves/stores them
 * in a Redis cache if possible.
 */
router.get('/all', async (req, res) => {
  try {
  const { Items } = await new DynamoDB().findAllItems();
  const promises = [];
  const cachePromises = [];
  Items.forEach((item) => {
    console.log('[INFO] Checking Cache for item: ', item.name);
    cachePromises.push(cache.getAsync(item.sid));
  });

  const cachedItems = await Promise.all(cachePromises);
  cachedItems.forEach((item, idx) => {
    const { name, sid } = Items[idx];
    if (item == null) {
      promises.push(request(`${GOOGLE_SEARCH_URL}${name}`).then((r) => {
        const data = JSON.parse(r);
        const images = data.items
            .map(({ pagemap }) => {
              if (typeof pagemap === 'undefined' || typeof pagemap.cse_image === 'undefined') return [];
              return pagemap.cse_image.map((i) => i.src);
            }).reduce((prev, curr) => [...prev, ...curr]);

        console.log(`Setting ${name} in the cache...`);
        cache.set(sid, JSON.stringify({
            ...Items[idx],
            images,
        }));
        return { ...Items[idx], images };
      }));
    } else {
      console.log(`[INFO] Found Cached Item: ${name}`);
      promises.push(new Promise((resolve) => resolve(JSON.parse(item))));
    }
  });

    await Promise.all(promises).then((data) => res.json(_.groupBy(data, 'pid')));
  } catch (e) {
    console.log(`[ERROR] Failed to fetch item images for category: ${req.params.categoryId}`, e);
  }
});

/**
 * Finds all items within a given category
 */
router.get('/:categoryId', async (req, res) => {
  if (!req.params.categoryId) {
    console.log('[ERROR] Category Id is missing from the request parameters: Category Id = ', req.params.categoryId);
    res.json({ error: true, message: `Category Id is missing from the request parameters: Category Id = ${req.params.categoryId}` });
  }

  try {
    const { Items } = await new DynamoDB().findAllItemsByCategory(req.params.categoryId);
    res.json(Items);
  } catch (err) {
    NODE_ENV !== 'test' && console.log('[ERROR] GET -- /api/v1/items/ There was an error attempting to retrieve all items for given category: ', req.body, err);
    res.status(500);
    res.json({ error: true, message: err.message });
  }
});

module.exports = router;
