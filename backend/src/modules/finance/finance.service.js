const culturesRepo = require('../cultures/cultures.repository');
const activitiesRepo = require('../activities/activities.repository');

const buildScope = (profile) => {
  if (!profile) return null;
  return { userId: profile.id, role: profile.role, allowedIds: profile.allowedIds || [] };
};

const getFinance = async (profile = null) => {
  const scope = buildScope(profile);
  const [cultures, activities] = await Promise.all([
    culturesRepo.getAll(scope),
    activitiesRepo.getAll(scope),
  ]);

  const totalCost = activities.reduce((sum, a) => sum + a.cost, 0);
  const totalRevenue = cultures.reduce((sum, c) => sum + c.expectedRevenue, 0);
  const estimatedProfit = totalRevenue - totalCost;
  const marginPercent = totalRevenue > 0
    ? Number(((estimatedProfit / totalRevenue) * 100).toFixed(2))
    : 0;

  // byCulture — frontend usa d.cultureName || d.name e d.cost
  const byCulture = cultures.map((c) => {
    const cost = activities
      .filter((a) => a.cultureId === c.id)
      .reduce((sum, a) => sum + (a.cost || 0), 0);
    return { cultureName: c.name, cost, expectedRevenue: c.expectedRevenue };
  });

  // byMonth — frontend usa d.month e d.cost
  const monthMap = {};
  activities.forEach((a) => {
    const month = a.date ? String(a.date).slice(0, 7) : null;
    if (month) monthMap[month] = (monthMap[month] || 0) + (a.cost || 0);
  });
  const byMonth = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, cost]) => ({ month, cost }));

  // byActivityType — agrupa pelo campo tipo da atividade
  const typeMap = {};
  activities.forEach((a) => {
    const t = a.tipo || 'Outro';
    typeMap[t] = (typeMap[t] || 0) + (a.cost || 0);
  });
  const byActivityType = Object.entries(typeMap)
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
    .map(([type, cost]) => ({ type, cost }));

  return {
    totalCost,
    expectedRevenue: totalRevenue,   // campo que o frontend espera
    estimatedProfit,
    marginPercent,
    byCulture,
    byMonth,
    byActivityType,
  };
};

module.exports = { getFinance };
