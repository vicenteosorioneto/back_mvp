const culturesRepo = require('../cultures/cultures.repository');
const activitiesRepo = require('../activities/activities.repository');

const buildScope = (profile) => {
  if (!profile) return null;
  return { userId: profile.id, role: profile.role, allowedIds: profile.allowedIds || [] };
};

const getHistory = async (profile = null) => {
  const scope = buildScope(profile);
  const [cultures, activities] = await Promise.all([
    culturesRepo.getAll(scope),
    activitiesRepo.getAll(scope),
  ]);

  return cultures.map((culture) => {
    const cultureActivities = activities
      .filter((a) => a.cultureId === culture.id)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const totalCost = cultureActivities.reduce((sum, a) => sum + a.cost, 0);

    return {
      cultureId: culture.id,
      cultureName: culture.name,
      propertyId: culture.propertyId || null,
      status: culture.status,
      plantingDate: culture.plantingDate,
      harvestDate: culture.harvestDate,
      expectedRevenue: culture.expectedRevenue,
      totalCost,
      estimatedProfit: culture.expectedRevenue - totalCost,
      // frontend usa group.activities para renderizar os itens
      activities: cultureActivities.map((a) => ({
        id: a.id,
        title: a.title,
        date: a.date,
        status: a.status,
        assignee: a.assignee || null,   // toCamel converte DB.responsible → assignee
        cost: a.cost,
        notes: a.notes || null,
        photoUrl: a.photoUrl || null,
      })),
    };
  });
};

module.exports = { getHistory };
