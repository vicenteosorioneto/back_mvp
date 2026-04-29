const express = require('express');
const controller = require('./activities.controller');
const optionalAuth = require('../../shared/middlewares/optionalAuth');
const upload = require('../../shared/middlewares/upload');

const router = express.Router();

router.use(optionalAuth);

router.get('/activities', controller.getAll);
router.get('/activities/:id', controller.getById);
router.post('/activities', upload.single('photo'), controller.create);
router.put('/activities/:id', controller.update);
router.patch('/activities/:id/status', controller.updateStatus);
router.delete('/activities/:id', controller.delete);

module.exports = router;
