const express = require('express');

const router = express.Router();
const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
const uuid = require('uuid/v1');

router.post('/create', async (req, res) => {
  const params = {
    TableName: 'inventory',
    Item: {
      pid: 'category',
      sid: `category-${uuid().substring(10)}`,
      name: req.body.name,
    },
  };

  try {
    const response = await ddb.put(params).promise();
    res.json(response);
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
    ExpressionAttributeValues: {
      ':pid': 'category',
    },
    KeyConditionExpression: 'pid = :pid',
  };
  try {
    const response = await ddb.query(params).promise();
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
