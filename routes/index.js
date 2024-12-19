const express = require('express');
const userRoutes = require('./userRoutes');
const todoRoutes = require('./todoRoutes');

const router = express.Router();

router.use('', userRoutes);
router.use('/todos', todoRoutes);

module.exports = router;
