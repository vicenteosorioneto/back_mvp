const repository = require('./cultures.repository');
const AppError = require('../../shared/errors/AppError');

const STATUS_MAP = {
  ativa: 'active', planejada: 'active', colhida: 'harvested', cancelada: 'cancelled',
};
const normalizeCultureStatus = (s) => STATUS_MAP[s] || s || 'active';

const buildScope = (profile) => {
  if (!profile) return null;
  return { userId: profile.id, role: profile.role, allowedIds: profile.allowedIds || [] };
};

const getAll = async (profile = null, filters = {}) => {
  let results = await repository.getAll(buildScope(profile));
  if (filters.status) {
    const norm = normalizeCultureStatus(filters.status);
    results = results.filter((c) => c.status === norm);
  }
  if (filters.propertyId) {
    results = results.filter((c) => c.propertyId === filters.propertyId);
  }
  return results;
};

const getById = async (id) => {
  const culture = await repository.getById(id);
  if (!culture) throw new AppError('Cultura não encontrada', 404);
  return culture;
};

const create = async (data, profile = null) => {
  if (!data.name || !String(data.name).trim()) throw new AppError('Nome é obrigatório', 400);
  if (!data.plantingDate) throw new AppError('Data de plantio é obrigatória', 400);
  if (!data.harvestDate) throw new AppError('Data de colheita é obrigatória', 400);

  const planting = new Date(data.plantingDate);
  const harvest = new Date(data.harvestDate);

  if (isNaN(planting.getTime())) throw new AppError('Data de plantio inválida', 400);
  if (isNaN(harvest.getTime())) throw new AppError('Data de colheita inválida', 400);
  if (harvest <= planting) throw new AppError('A data de colheita deve ser posterior à data de plantio', 400);

  return await repository.create({
    ...data,
    ownerId: profile?.id || null,
    status: normalizeCultureStatus(data.status),
  });
};

const update = async (id, data, profile = null) => {
  if (data.harvestDate && data.plantingDate) {
    const planting = new Date(data.plantingDate);
    const harvest = new Date(data.harvestDate);
    if (!isNaN(planting.getTime()) && !isNaN(harvest.getTime()) && harvest <= planting) {
      throw new AppError('A data de colheita deve ser posterior à data de plantio', 400);
    }
  }
  if (data.status) data = { ...data, status: normalizeCultureStatus(data.status) };
  const culture = await repository.update(id, data);
  if (!culture) throw new AppError('Cultura não encontrada', 404);
  return culture;
};

const deleteCulture = async (id) => {
  const culture = await repository.getById(id);
  if (!culture) throw new AppError('Cultura não encontrada', 404);
  const activities = await repository.getActivitiesByCultureId(id);
  if (activities.length > 0) throw new AppError('Não é possível deletar uma cultura com atividades vinculadas', 400);
  await repository.delete(id);
};

module.exports = { getAll, getById, create, update, delete: deleteCulture };
