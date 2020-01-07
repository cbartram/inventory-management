const { NODE_ENV, GOOGLE_SEARCH_URL } = process.env;
const express = require('express');

const router = express.Router();
const uuid = require('uuid/v4');
const AWS = require('aws-sdk');
const request = require('request-promise-native');

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

/**
 * Uses the google search API to
 */
router.get('/image/query/:query', (req, res) => {
  console.log('[INFO] Fetching images for search query: ', req.params.query);
  request(`${GOOGLE_SEARCH_URL}${req.params.query}`).then(response => {
    const data = JSON.parse(response);
    const images = data.items
        .map(({ pagemap }) =>  pagemap.cse_image.map(i => i.src))
        .reduce((prev, curr) => [...prev, ...curr]);
    return res.json({ images })
  });
});

/**
 * Finds all items within a given category
 */
router.get('/:categoryId', async (req, res) => {
  const ddb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

  if (!req.params.categoryId) {
    console.log('[ERROR] Category Id is missing from the request parameters: Category Id = ', req.params.categoryId);
    res.json({ error: true, message: `Category Id is missing from the request parameters: Category Id = ${req.params.categoryId}` });
  }

  const params = {
    TableName: 'inventory',
    KeyConditionExpression: '#pid = :pid and begins_with(#sid, :sid)',
    ExpressionAttributeNames: {
      '#pid': 'pid',
      '#sid': 'sid',
    },
    ExpressionAttributeValues: {
      ':pid': req.params.categoryId,
      ':sid': 'item-',
    },
  };
  try {
    NODE_ENV !== 'test' && console.log('[INFO] Attempting to find all items for category: ', req.params.categoryId);
    const response = await ddb.query(params).promise();
    NODE_ENV !== 'test' && console.log(`[INFO] Successfully found: ${response.Items.length} items for category Id: ${req.params.categoryId}.`);
    res.json(response.Items);
  } catch (err) {
    NODE_ENV !== 'test' && console.log('[ERROR] GET -- /api/v1/items/ There was an error attempting to retrieve all items for given category: ', req.body, err);
    res.status(500);
    res.json({ error: true, message: err.message });
  }
});

module.exports = router;
