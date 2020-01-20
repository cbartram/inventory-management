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
/**
 * Handles deleting both categories and items from DynamoDB
 */
router.delete('/delete/all', async (req, res) => {
  const { items, categories } = req.body;
  NODE_ENV !== 'test' && console.log('[INFO] Attempting to delete: ', items, categories);
  if (items.length === 0 && categories.length === 0) {
    res.json({ numDeleted: 0, message: 'Nothing to delete' });
    return;
  }
  const ddb = new DynamoDB();

  if (items.length !== 0) {
    const itemsResponse = await ddb.bulkDelete(items);
    NODE_ENV !== 'test' && console.log('[INFO] Delete Item(s) Response: {}', itemsResponse);
  }

  if (categories.length !== 0) {
    // TODO Get all the items of each category and delete them all as well. When a category is deleted so are its items

    const categoriesResponse = await ddb.bulkDelete(categories);
    NODE_ENV !== 'test' && console.log('[INFO] Delete Categories(s) Response: {}', categoriesResponse);
  }

  res.json({ success: true, numDeleted: items.length + categories.length });
});

router.use('/category', categoryController);
router.use('/item', itemController);

module.exports = router;
