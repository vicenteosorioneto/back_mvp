const PDFDocument = require('pdfkit');
const culturesRepo = require('../cultures/cultures.repository');
const activitiesRepo = require('../activities/activities.repository');
const propertiesRepo = require('../properties/properties.repository');

const buildScope = (profile) => {
  if (!profile) return null;
  return { userId: profile.id, role: profile.role, allowedIds: profile.allowedIds || [] };
};

const generateCsv = async (profile = null) => {
  const scope = buildScope(profile);
  const [cultures, activities, properties] = await Promise.all([
    culturesRepo.getAll(scope),
    activitiesRepo.getAll(scope),
    propertiesRepo.getAll(scope),
  ]);

  const lines = [];

  lines.push('PROPRIEDADES');
  lines.push('Nome,Cidade,Estado,Hectares,Tipo de Produção');
  properties.forEach((p) => {
    lines.push(`"${p.name}","${p.city || ''}","${p.state || ''}",${p.hectares},"${p.productionType || ''}"`);
  });

  lines.push('');
  lines.push('CULTURAS');
  lines.push('Nome,Data Plantio,Data Colheita,Receita Prevista,Status');
  cultures.forEach((c) => {
    lines.push(`"${c.name}",${c.plantingDate},${c.harvestDate},${c.expectedRevenue},${c.status}`);
  });

  lines.push('');
  lines.push('ATIVIDADES');
  lines.push('Título,Data,Responsável,Custo,Status,Notas');
  activities.forEach((a) => {
    lines.push(`"${a.title}",${a.date},"${a.responsible || ''}",${a.cost},${a.status},"${a.notes || ''}"`);
  });

  const totalCost = activities.reduce((sum, a) => sum + a.cost, 0);
  const totalRevenue = cultures.reduce((sum, c) => sum + c.expectedRevenue, 0);
  lines.push('');
  lines.push('RESUMO FINANCEIRO');
  lines.push(`Custo Total,${totalCost}`);
  lines.push(`Receita Prevista,${totalRevenue}`);
  lines.push(`Lucro Estimado,${totalRevenue - totalCost}`);

  return lines.join('\n');
};

const generatePdf = async (profile = null) => {
  const scope = buildScope(profile);
  const [cultures, activities, properties] = await Promise.all([
    culturesRepo.getAll(scope),
    activitiesRepo.getAll(scope),
    propertiesRepo.getAll(scope),
  ]);

  const totalCost = activities.reduce((sum, a) => sum + a.cost, 0);
  const totalRevenue = cultures.reduce((sum, c) => sum + c.expectedRevenue, 0);

  const doc = new PDFDocument({ margin: 40 });
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));

  doc.fontSize(22).font('Helvetica-Bold').text('MVP Agro — Relatório', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
  doc.moveDown(1.5);

  doc.fontSize(14).font('Helvetica-Bold').text('Resumo Financeiro');
  doc.moveDown(0.3);
  doc.fontSize(11).font('Helvetica');
  doc.text(`Custo Total: R$ ${totalCost.toFixed(2)}`);
  doc.text(`Receita Prevista: R$ ${totalRevenue.toFixed(2)}`);
  doc.text(`Lucro Estimado: R$ ${(totalRevenue - totalCost).toFixed(2)}`);
  doc.moveDown(1);

  if (properties.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold').text('Propriedades');
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica');
    properties.forEach((p) => {
      doc.text(`• ${p.name} — ${p.city || ''}/${p.state || ''} — ${p.hectares} ha`);
    });
    doc.moveDown(1);
  }

  doc.fontSize(14).font('Helvetica-Bold').text('Culturas');
  doc.moveDown(0.3);
  doc.fontSize(11).font('Helvetica');
  cultures.forEach((c) => {
    doc.text(`• ${c.name} (${c.status}) — Colheita: ${c.harvestDate} — Receita: R$ ${c.expectedRevenue.toFixed(2)}`);
  });
  doc.moveDown(1);

  doc.fontSize(14).font('Helvetica-Bold').text('Atividades');
  doc.moveDown(0.3);
  doc.fontSize(11).font('Helvetica');
  activities.forEach((a) => {
    doc.text(`• ${a.title} (${a.status}) — ${a.date} — R$ ${a.cost.toFixed(2)}${a.responsible ? ` — ${a.responsible}` : ''}`);
  });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });
};

module.exports = { generateCsv, generatePdf };
