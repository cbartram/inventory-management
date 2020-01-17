const { NODE_ENV } = process.env;
const express = require('express');

const router = express.Router();

const categoryController = require('./categoryController');
const itemController = require('./itemController');
const { version } = require('../package');
const DynamoDB = require('../src/DynamoDB');

router.get('/', (req, res) => {
  res.json({
    version,
    message: 'Inventory Management API',
  });
});

// Delete route is here because it handles both deleting categories and items
router.delete('/delete/all', async (req, res) => {
  const { items, categories } = req.body;
  NODE_ENV !== 'test' && console.log('[INFO] Attempting to delete: ', items, categories);
  if (items.length === 0 && categories.length === 0) res.json({ numDeleted: 0, message: 'Nothing to delete' });
  const ddb = new DynamoDB();

  if(items.length !== 0) {
    const itemsResponse = await ddb.bulkDelete(items);
    NODE_ENV !== 'test' && console.log('[INFO] Delete Item(s) Response: {}', itemsResponse);
  }

  if(categories.length !== 0) {
    const categoriesResponse = await ddb.bulkDelete(categories);
    NODE_ENV !== 'test' && console.log('[INFO] Delete Categories(s) Response: {}', categoriesResponse);
  }

  res.json({ success: true });
});

router.use('/category', categoryController);
router.use('/item', itemController);

module.exports = router;
