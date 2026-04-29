const express = require('express');
const controller = require('./history.controller');

const router = express.Router();

router.get('/history', controller.getHistory);

module.exports = router;
