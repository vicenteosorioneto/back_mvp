const express = require('express');
const controller = require('./reports.controller');

const router = express.Router();

router.get('/reports/csv', controller.getCsv);
router.get('/reports/pdf', controller.getPdf);

module.exports = router;
