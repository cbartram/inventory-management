const { NODE_ENV } = process.env;
const express = require('express');

const router = express.Router();
const uuid = require('uuid/v1');
const AWS = require('aws-sdk');


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

  const id = uuid().substring(10);
  const Item = {
    pid: `category-${id}`,
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

// router.get('/:categoryId', (req, res) => {
//
// });

module.exports = router;
