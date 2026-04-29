const service = require('./cultures.service');

const getAll = async (req, res, next) => {
  try {
    const cultures = await service.getAll(req.profile, req.query);
    res.json({ success: true, data: cultures });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const culture = await service.getById(req.params.id);
    res.json({ success: true, data: culture });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const culture = await service.create(req.body, req.profile);
    res.status(201).json({ success: true, data: culture });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const culture = await service.update(req.params.id, req.body, req.profile);
    res.json({ success: true, data: culture });
  } catch (err) {
    next(err);
  }
};

const deleteCulture = async (req, res, next) => {
  try {
    await service.delete(req.params.id);
    res.json({ success: true, message: 'Cultura deletada' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, delete: deleteCulture };
