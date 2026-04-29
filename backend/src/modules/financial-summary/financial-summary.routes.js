const express = require('express');
const controller = require('./financial-summary.controller');

const router = express.Router();

router.get('/financial-summary', controller.getFinancialSummary);

module.exports = router;
