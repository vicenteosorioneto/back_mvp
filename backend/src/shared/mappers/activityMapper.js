const ACTIVITY_TYPES = ['Plantio', 'Irrigação', 'Adubação', 'Pulverização', 'Colheita', 'Manutenção', 'Outro'];

const computeStatus = (storedStatus, date) => {
  if (storedStatus === 'completed') return 'completed';
  if (date && new Date(date) < new Date()) return 'delayed';
  return storedStatus || 'pending';
};

const toCamel = (row) => ({
  id: row.id,
  ownerId: row.owner_id ?? null,
  propertyId: row.property_id ?? null,
  title: row.title,
  tipo: row.tipo ?? 'Outro',
  date: row.date,
  cultureId: row.culture_id ?? null,
  assignee: row.responsible ?? null,
  cost: Number(row.cost) || 0,
  status: computeStatus(row.status, row.date),
  notes: row.notes ?? null,
  photoUrl: row.photo_url ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toSnake = (data) => {
  const snake = {};
  if (data.ownerId !== undefined) snake.owner_id = data.ownerId;
  if (data.propertyId !== undefined) snake.property_id = data.propertyId;
  if (data.title !== undefined) snake.title = data.title;
  if (data.tipo !== undefined) snake.tipo = data.tipo;
  if (data.date !== undefined) snake.date = data.date;
  if (data.cultureId !== undefined) snake.culture_id = data.cultureId;
  if (data.assignee !== undefined) snake.responsible = data.assignee;
  if (data.cost !== undefined) snake.cost = Number(data.cost) || 0;
  if (data.status !== undefined) snake.status = data.status;
  if (data.notes !== undefined) snake.notes = data.notes;
  if (data.photoUrl !== undefined) snake.photo_url = data.photoUrl;
  return snake;
};

module.exports = { toCamel, toSnake, computeStatus, ACTIVITY_TYPES };
