const express = require('express');
const router = express.Router();

const { version } = require('../package');

router.get('/', (req, res) => {
   res.json({
       version,
       message: 'Inventory Management API'
   });
});

// router.use('/api/v1/skill', skillController);

module.exports = router;