const service = require('./alerts.service');

const getAll = async (req, res, next) => {
  try {
    const alerts = await service.getAll(req.profile);
    res.json({ success: true, data: alerts });
  } catch (err) {
    next(err);
  }
};

const generate = async (req, res, next) => {
  try {
    const result = await service.generate(req.profile);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const alert = await service.markAsRead(req.params.id, req.profile);
    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const counts = await service.markAllAsRead(req.profile);
    res.json({ success: true, data: counts });
  } catch (err) {
    next(err);
  }
};

const deleteAlert = async (req, res, next) => {
  try {
    await service.delete(req.params.id, req.profile);
    res.json({ success: true, message: 'Alerta deletado' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, generate, markAsRead, markAllAsRead, delete: deleteAlert };
