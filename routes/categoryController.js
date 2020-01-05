const { NODE_ENV } = process.env;
const express = require('express');

const router = express.Router();
const AWS = require('aws-sdk');
const uuid = require('uuid/v4');

router.post('/create', async (req, res) => {
  const ddb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
  if (!req.body.name) {
    NODE_ENV !== 'test' && console.log('[ERROR] Required body parameter missing: name');
    res.json({ error: true, message: 'Required body parameter missing: name' });
    return;
  }

  const id = uuid().substring(10);
  const Item = {
    pid: 'category',
    sid: `category-${id}`,
    name: req.body.name,
  };
  const params = {
    TableName: 'inventory',
    Item,
  };

  try {
    await ddb.put(params).promise();
    res.json(Item);
  } catch (err) {
    NODE_ENV !== 'test' && console.log('[ERROR] POST -- /api/v1/category/create There was an error attempting to create a new category: ', req.body, err);
    res.status(500);
    res.json({ error: true, message: err.message });
  }
});
//
// router.put('/update', (req, res) => {
//
// });
//
// router.delete('/delete', (req, res) => {
//
// });

router.get('/', async (req, res) => {
  const ddb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
  const params = {
    TableName: 'inventory',
    KeyConditionExpression: '#pid = :pid and begins_with(#sid, :sid)',
    ExpressionAttributeNames: {
      '#pid': 'pid',
      '#sid': 'sid',
    },
    ExpressionAttributeValues: {
      ':pid': 'category',
      ':sid': 'category-',
    },
  };
  try {
    const response = await ddb.query(params).promise();
    NODE_ENV !== 'test' && console.log(`[INFO] Successfully found: ${response.Items.length} categories.`);
    res.json(response.Items);
  } catch (err) {
    NODE_ENV !== 'test' && console.log('[ERROR] GET -- /api/v1/category/ There was an error attempting to retrieve all categories: ', req.body, err);
    res.status(500);
    res.json({ error: true, message: err.message });
  }
});

module.exports = router;
