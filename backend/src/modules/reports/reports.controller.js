const service = require('./reports.service');

const getCsv = async (req, res, next) => {
  try {
    const csv = await service.generateCsv(req.profile);
    res.header('Content-Type', 'text/csv');
    res.attachment('report.csv');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

const getPdf = async (req, res, next) => {
  try {
    const pdfBuffer = await service.generatePdf(req.profile);
    res.header('Content-Type', 'application/pdf');
    res.attachment('report.pdf');
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

module.exports = { getCsv, getPdf };
