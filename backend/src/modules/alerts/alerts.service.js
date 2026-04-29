const alertsRepo = require('./alerts.repository');
const culturesRepo = require('../cultures/cultures.repository');
const activitiesRepo = require('../activities/activities.repository');
const AppError = require('../../shared/errors/AppError');

const HIGH_COST_THRESHOLD = 1000;
const HARVEST_WARNING_DAYS = 15;

const buildScope = (profile) => {
  if (!profile) return null;
  return { userId: profile.id, role: profile.role, allowedIds: profile.allowedIds || [] };
};

const getAll = async (profile) => {
  const ownerId = profile?.id || null;
  const scope = ownerId ? { userId: ownerId } : null;
  const [alerts, counts] = await Promise.all([
    alertsRepo.getAll(scope),
    alertsRepo.getCount(ownerId),
  ]);
  return { alerts, ...counts };
};

const markAllAsRead = async (profile) => {
  const ownerId = profile?.id || null;
  await alertsRepo.markAllAsRead(ownerId);
  return await alertsRepo.getCount(ownerId);
};

const generate = async (profile) => {
  const scope = buildScope(profile);
  const ownerId = profile?.id || null;

  const [cultures, activities] = await Promise.all([
    culturesRepo.getAll(scope),
    activitiesRepo.getAll(scope),
  ]);

  const now = new Date();
  const warnings = [];

  for (const activity of activities) {
    // activityMapper.computeStatus já retorna 'delayed' para pendentes com data vencida
    if (activity.status === 'delayed') {
      const alreadyExists = await alertsRepo.existsUnread(ownerId, 'activity_delayed', activity.id);
      if (!alreadyExists) {
        warnings.push({
          ownerId,
          type: 'activity_delayed',
          message: `Atividade "${activity.title}" está atrasada (data: ${activity.date})`,
          severity: 'critical',
          referenceId: activity.id,
          referenceType: 'activity',
        });
      }
    }

    // toCamel mapeia DB.responsible → activity.assignee
    if (!activity.assignee) {
      const alreadyExists = await alertsRepo.existsUnread(ownerId, 'activity_no_responsible', activity.id);
      if (!alreadyExists) {
        warnings.push({
          ownerId,
          type: 'activity_no_responsible',
          message: `Atividade "${activity.title}" não tem responsável definido`,
          severity: 'warning',
          referenceId: activity.id,
          referenceType: 'activity',
        });
      }
    }

    if (activity.cost >= HIGH_COST_THRESHOLD) {
      const alreadyExists = await alertsRepo.existsUnread(ownerId, 'high_cost', activity.id);
      if (!alreadyExists) {
        warnings.push({
          ownerId,
          type: 'high_cost',
          message: `Atividade "${activity.title}" tem custo elevado: R$ ${activity.cost.toFixed(2)}`,
          severity: 'warning',
          referenceId: activity.id,
          referenceType: 'activity',
        });
      }
    }
  }

  for (const culture of cultures) {
    const harvestDate = new Date(culture.harvestDate);
    const daysUntilHarvest = Math.ceil((harvestDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntilHarvest > 0 && daysUntilHarvest <= HARVEST_WARNING_DAYS) {
      const alreadyExists = await alertsRepo.existsUnread(ownerId, 'harvest_upcoming', culture.id);
      if (!alreadyExists) {
        warnings.push({
          ownerId,
          type: 'harvest_upcoming',
          message: `Cultura "${culture.name}" tem colheita em ${daysUntilHarvest} dia(s)`,
          severity: daysUntilHarvest <= 5 ? 'critical' : 'warning',
          referenceId: culture.id,
          referenceType: 'culture',
        });
      }
    }

    const cultureActivities = activities.filter((a) => a.cultureId === culture.id);
    if (cultureActivities.length === 0) {
      const alreadyExists = await alertsRepo.existsUnread(ownerId, 'culture_no_activity', culture.id);
      if (!alreadyExists) {
        warnings.push({
          ownerId,
          type: 'culture_no_activity',
          message: `Cultura "${culture.name}" não tem nenhuma atividade cadastrada`,
          severity: 'info',
          referenceId: culture.id,
          referenceType: 'culture',
        });
      }
    }
  }

  const created = await alertsRepo.createMany(warnings);
  return { generated: created.length, alerts: created };
};

const markAsRead = async (id, profile) => {
  const alert = await alertsRepo.getById(id);
  if (!alert) throw new AppError('Alerta não encontrado', 404);
  if (profile && profile.role !== 'admin' && alert.ownerId !== profile.id) {
    throw new AppError('Acesso não autorizado', 403);
  }
  const updated = await alertsRepo.markAsRead(id);
  return updated;
};

const deleteAlert = async (id, profile) => {
  const alert = await alertsRepo.getById(id);
  if (!alert) throw new AppError('Alerta não encontrado', 404);
  if (profile && profile.role !== 'admin' && alert.ownerId !== profile.id) {
    throw new AppError('Acesso não autorizado', 403);
  }
  await alertsRepo.delete(id);
};

module.exports = { getAll, generate, markAsRead, markAllAsRead, delete: deleteAlert };
