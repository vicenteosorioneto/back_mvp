const service = require('./activities.service');

const getAll = async (req, res, next) => {
  try {
    const activities = await service.getAll(req.profile, req.query);
    res.json({ success: true, data: activities });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const activity = await service.getById(req.params.id);
    res.json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) data.photoUrl = `/uploads/${req.file.filename}`;
    const activity = await service.create(data, req.profile);
    res.status(201).json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const activity = await service.update(req.params.id, req.body, req.profile);
    res.json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const activity = await service.updateStatus(req.params.id, req.body.status);
    res.json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
};

const deleteActivity = async (req, res, next) => {
  try {
    await service.delete(req.params.id);
    res.json({ success: true, message: 'Atividade deletada' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, updateStatus, delete: deleteActivity };
