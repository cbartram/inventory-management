const express = require('express');

const router = express.Router();
const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
const uuid = require('uuid/v1');

router.post('/create', async (req, res) => {
  if (!req.body.name) {
    res.json({ error: true, message: 'Required body parameter missing: name' });
    return;
  }

  const id = uuid().substring(10);
  const Item = {
    pid: `category-${id}`,
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
    console.log('[ERROR] POST -- /api/v1/category/create There was an error attempting to create a new category: ', req.body, err);
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
  const params = {
    TableName: 'inventory',
  };
  try {
    const response = await ddb.scan(params).promise();
    console.log('[INFO] Successfully found: ', response.Items.length);
    res.json(response.Items);
  } catch (err) {
    console.log('[ERROR] GET -- /api/v1/category/ There was an error attempting to retrieve all categories: ', req.body, err);
  }
});

// router.get('/:id', (req, res) => {
//   // const params = {
//   //     TableName: 'inventory',
//   //     Key: {
//   //         pid: 'category'
//   //     }
//   // };
//   // try {
//   //     const res = await ddb.get(params).promise();
//   //     res.json(res);
//   // } catch(err) {
//   //     console.log("[ERROR] GET -- /api/v1/category/ There was an error attempting to retrieve all categories: ", req.body, err);
//   // }
// });

module.exports = router;
