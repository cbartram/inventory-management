const express = require('express');
const router = express.Router();

const categoryController = require('./categoryController');

const { version } = require('../package');

router.get('/', (req, res) => {
  res.json({
    version,
    message: 'Inventory Management API',
  });
});

router.use('/category', categoryController);

module.exports = router;
