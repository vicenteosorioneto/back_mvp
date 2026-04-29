const toCamel = (row) => ({
  id: row.id,
  ownerId: row.owner_id ?? null,
  propertyId: row.property_id ?? null,
  name: row.name,
  area: row.area != null ? Number(row.area) : null,
  plantingDate: row.planting_date,
  harvestDate: row.harvest_date,
  notes: row.notes ?? null,
  expectedRevenue: Number(row.expected_revenue) || 0,
  status: row.status || 'active',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toSnake = (data) => {
  const snake = {};
  if (data.ownerId !== undefined) snake.owner_id = data.ownerId;
  if (data.propertyId !== undefined) snake.property_id = data.propertyId;
  if (data.name !== undefined) snake.name = data.name;
  if (data.area !== undefined) snake.area = data.area != null ? Number(data.area) : null;
  if (data.plantingDate !== undefined) snake.planting_date = data.plantingDate;
  if (data.harvestDate !== undefined) snake.harvest_date = data.harvestDate;
  if (data.notes !== undefined) snake.notes = data.notes;
  if (data.expectedRevenue !== undefined) snake.expected_revenue = Number(data.expectedRevenue) || 0;
  if (data.status !== undefined) snake.status = data.status;
  return snake;
};

module.exports = { toCamel, toSnake };
