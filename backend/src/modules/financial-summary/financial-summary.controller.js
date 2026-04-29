const service = require('./financial-summary.service');

const getFinancialSummary = async (req, res, next) => {
  try {
    const data = await service.getFinancialSummary(req.profile);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFinancialSummary };
