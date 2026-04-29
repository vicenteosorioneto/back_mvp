const service = require('./finance.service');

const getFinance = async (req, res, next) => {
  try {
    const data = await service.getFinance(req.profile);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFinance };
