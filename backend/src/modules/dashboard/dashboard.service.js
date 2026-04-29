const culturesRepo = require('../cultures/cultures.repository');
const activitiesRepo = require('../activities/activities.repository');
const propertiesRepo = require('../properties/properties.repository');

const buildScope = (profile) => {
  if (!profile) return null;
  return { userId: profile.id, role: profile.role, allowedIds: profile.allowedIds || [] };
};

// Normaliza status em PT para EN (para dados já salvos com status em português)
const normalizeCultureStatus = (s) => {
  const map = { ativa: 'active', planejada: 'active', colhida: 'harvested', cancelada: 'cancelled' };
  return map[s] || s;
};

const getDashboard = async (profile = null) => {
  const scope = buildScope(profile);

  const [cultures, activities, properties] = await Promise.all([
    culturesRepo.getAll(scope),
    activitiesRepo.getAll(scope),
    propertiesRepo.getAll(scope),
  ]);

  const now = new Date();
  const fifteenDaysLater = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

  const totalCultures = cultures.length;
  // status pode estar em PT (dados antigos) ou EN (dados novos) — normaliza os dois
  const activeCultures = cultures.filter((c) => normalizeCultureStatus(c.status) === 'active').length;

  const totalActivities = activities.length;
  // activityMapper.computeStatus já retorna 'pending' | 'completed' | 'delayed'
  const pendingActivities = activities.filter((a) => a.status === 'pending').length;
  const doneActivities    = activities.filter((a) => a.status === 'completed').length;
  const lateActivities    = activities.filter((a) => a.status === 'delayed').length;

  const totalCost = activities.reduce((sum, a) => sum + (a.cost || 0), 0);
  const expectedRevenue = cultures.reduce((sum, c) => sum + (c.expectedRevenue || 0), 0);
  const estimatedProfit = expectedRevenue - totalCost;
  const marginPercent = expectedRevenue > 0
    ? Number(((estimatedProfit / expectedRevenue) * 100).toFixed(2))
    : 0;

  // Array de objetos com dados da colheita (frontend espera [{name, harvestDate, propertyName}])
  const upcomingHarvests = cultures
    .filter((c) => {
      const harvest = new Date(c.harvestDate);
      return harvest >= now && harvest <= fifteenDaysLater;
    })
    .sort((a, b) => new Date(a.harvestDate) - new Date(b.harvestDate))
    .map((c) => {
      const prop = properties.find((p) => p.id === c.propertyId);
      return { name: c.name, harvestDate: c.harvestDate, propertyName: prop?.name || '' };
    });

  return {
    totalProperties: properties.length,
    totalCultures,
    activeCultures,
    totalActivities,
    pendingActivities,
    doneActivities,
    lateActivities,
    upcomingHarvests,
    totalCost,
    expectedRevenue,
    estimatedProfit,
    marginPercent,
  };
};

module.exports = { getDashboard };
