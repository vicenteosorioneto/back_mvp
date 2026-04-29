const service = require('./history.service');

const getHistory = async (req, res, next) => {
  try {
    const data = await service.getHistory(req.profile);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getHistory };
