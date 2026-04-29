const culturesRepo = require('../cultures/cultures.repository');
const activitiesRepo = require('../activities/activities.repository');

const buildScope = (profile) => {
  if (!profile) return null;
  return { userId: profile.id, role: profile.role, allowedIds: profile.allowedIds || [] };
};

const getFinancialSummary = async (profile = null) => {
  const scope = buildScope(profile);
  const [cultures, activities] = await Promise.all([
    culturesRepo.getAll(scope),
    activitiesRepo.getAll(scope),
  ]);

  return cultures.map((culture) => {
    const cultureActivities = activities.filter((a) => a.cultureId === culture.id);
    const totalCosts = cultureActivities.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);
    const expectedRevenue = Number(culture.expectedRevenue) || 0;

    return {
      id: culture.id,
      cultureName: culture.name,
      expectedRevenue,
      totalCosts,
      estimatedMargin: expectedRevenue - totalCosts,
    };
  });
};

module.exports = { getFinancialSummary };
