const toCamel = (row) => ({
  id: row.id,
  ownerId: row.owner_id ?? null,
  name: row.name,
  city: row.city ?? null,
  state: row.state ?? null,
  hectares: Number(row.hectares) || 0,
  productionType: row.production_type ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toSnake = (data) => {
  const snake = {};
  if (data.ownerId !== undefined) snake.owner_id = data.ownerId;
  if (data.name !== undefined) snake.name = data.name;
  if (data.city !== undefined) snake.city = data.city;
  if (data.state !== undefined) snake.state = data.state;
  if (data.hectares !== undefined) snake.hectares = Number(data.hectares) || 0;
  if (data.productionType !== undefined) snake.production_type = data.productionType;
  return snake;
};

module.exports = { toCamel, toSnake };
