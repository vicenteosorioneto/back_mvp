const repository = require('./activities.repository');
const AppError = require('../../shared/errors/AppError');
const { ACTIVITY_TYPES } = require('../../shared/mappers/activityMapper');

const STATUS_MAP = {
  concluida: 'completed', 'concluída': 'completed',
  pendente:  'pending',
  atrasada:  'pending',
};

const normalizeStatus = (status) => STATUS_MAP[status] || status || 'pending';

const normalizeTipo = (tipo) => {
  if (!tipo) return 'Outro';
  const found = ACTIVITY_TYPES.find((t) => t.toLowerCase() === tipo.toLowerCase());
  return found || 'Outro';
};

const buildScope = (profile) => {
  if (!profile) return null;
  return { userId: profile.id, role: profile.role, allowedIds: profile.allowedIds || [] };
};

// Mapa para normalizar filtros PT→EN (inclui 'atrasada' que mapeia para 'delayed' no computeStatus)
const FILTER_STATUS_MAP = {
  concluida: 'completed', 'concluída': 'completed', completed: 'completed',
  pendente:  'pending',   pending:    'pending',
  atrasada:  'delayed',   delayed:    'delayed',
};

const getAll = async (profile = null, filters = {}) => {
  let results = await repository.getAll(buildScope(profile));
  if (filters.status) {
    const norm = FILTER_STATUS_MAP[filters.status] || filters.status;
    results = results.filter((a) => a.status === norm);
  }
  if (filters.tipo)       results = results.filter((a) => (a.tipo || 'Outro') === normalizeTipo(filters.tipo));
  if (filters.cultureId)  results = results.filter((a) => a.cultureId  === filters.cultureId);
  if (filters.propertyId) results = results.filter((a) => a.propertyId === filters.propertyId);
  if (filters.startDate)  results = results.filter((a) => a.date >= filters.startDate);
  if (filters.endDate)    results = results.filter((a) => a.date <= filters.endDate);
  return results;
};

const getById = async (id) => {
  const activity = await repository.getById(id);
  if (!activity) throw new AppError('Atividade não encontrada', 404);
  return activity;
};

const create = async (data, profile = null) => {
  if (!data.title) throw new AppError('Título é obrigatório', 400);
  if (!data.date) throw new AppError('Data é obrigatória', 400);
  if (data.cultureId) {
    const exists = await repository.cultureExists(data.cultureId);
    if (!exists) throw new AppError('Cultura não encontrada', 400);
  }
  return await repository.create({
    ...data,
    tipo: normalizeTipo(data.tipo),
    status: normalizeStatus(data.status),
    ownerId: profile?.id || null,
  });
};

const update = async (id, data, profile = null) => {
  if (data.cultureId) {
    const exists = await repository.cultureExists(data.cultureId);
    if (!exists) throw new AppError('Cultura não encontrada', 400);
  }
  const payload = { ...data };
  if (payload.status) payload.status = normalizeStatus(payload.status);
  if (payload.tipo !== undefined) payload.tipo = normalizeTipo(payload.tipo);
  const activity = await repository.update(id, payload);
  if (!activity) throw new AppError('Atividade não encontrada', 404);
  return activity;
};

const updateStatus = async (id, status) => {
  if (!status) throw new AppError('Status é obrigatório', 400);
  const normalized = normalizeStatus(status);
  const activity = await repository.update(id, { status: normalized });
  if (!activity) throw new AppError('Atividade não encontrada', 404);
  return activity;
};

const deleteActivity = async (id) => {
  const activity = await repository.getById(id);
  if (!activity) throw new AppError('Atividade não encontrada', 404);
  await repository.delete(id);
};

module.exports = { getAll, getById, create, update, updateStatus, delete: deleteActivity };
