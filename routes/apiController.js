const express = require('express');

const router = express.Router();

const categoryController = require('./categoryController');
const itemController = require('./itemController');
const { version } = require('../package');

router.get('/', (req, res) => {
  res.json({
    version,
    message: 'Inventory Management API',
  });
});

router.use('/category', categoryController);
router.use('/item', itemController);

module.exports = router;
