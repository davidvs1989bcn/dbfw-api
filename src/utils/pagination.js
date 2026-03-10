// ============================================
// Utilidad de paginación
// ============================================

/**
 * Extrae y valida parámetros de paginación del query string
 * @param {object} query - req.query
 * @returns {{ page, limit, offset }}
 */
const getPagination = (query) => {
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || 25;

  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100; // máximo 100 por página

  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Genera el objeto de respuesta paginada
 */
const paginatedResponse = (data, total, page, limit) => {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

module.exports = { getPagination, paginatedResponse };
