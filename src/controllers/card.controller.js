// ============================================
// Controlador de cartas
// ============================================
const cardService = require('../services/card.service');
const { getPagination, paginatedResponse } = require('../utils/pagination');

const getAll = async (req, res) => {
  try {
    const pagination = getPagination(req.query);
    const filters = {
      name: req.query.name,
      color: req.query.color,
      card_type: req.query.card_type,
      rarity: req.query.rarity,
      set_id: req.query.set_id,
      cost: req.query.cost,
      min_power: req.query.min_power,
      max_power: req.query.max_power,
      features: req.query.features,
      effect: req.query.effect
    };

    const { cards, total, page, limit } = await cardService.getAll(filters, pagination);
    res.json(paginatedResponse(cards, total, page, limit));

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const card = await cardService.getById(req.params.id);
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro "q" debe tener al menos 2 caracteres.'
      });
    }
    const results = await cardService.search(q);
    res.json({ success: true, data: results, total: results.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const card = await cardService.create(req.body);
    res.status(201).json({ success: true, data: card });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const card = await cardService.update(req.params.id, req.body);
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await cardService.delete(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

module.exports = { getAll, getById, search, create, update, remove };
