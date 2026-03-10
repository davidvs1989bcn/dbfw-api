// ============================================
// Controlador de mazos
// ============================================
const deckService = require('../services/deck.service');
const { getPagination, paginatedResponse } = require('../utils/pagination');

const getPublicDecks = async (req, res) => {
  try {
    const pagination = getPagination(req.query);
    const filters = {
      color: req.query.color,
      leader: req.query.leader,
      user_id: req.query.user_id,
      is_valid: req.query.is_valid
    };
    const { decks, total, page, limit } = await deckService.getPublicDecks(filters, pagination);
    res.json(paginatedResponse(decks, total, page, limit));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyDecks = async (req, res) => {
  try {
    const decks = await deckService.getUserDecks(req.user.id);
    res.json({ success: true, data: decks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const deck = await deckService.getById(parseInt(req.params.id), userId);
    res.json({ success: true, data: deck });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const deck = await deckService.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: deck });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const addCards = async (req, res) => {
  try {
    const { cards } = req.body; // [{ card_id, quantity }]
    if (!cards || !Array.isArray(cards)) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array "cards" con { card_id, quantity }.'
      });
    }
    const deck = await deckService.addCards(parseInt(req.params.id), req.user.id, cards);
    res.json({ success: true, data: deck });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const removeCard = async (req, res) => {
  try {
    const deck = await deckService.removeCard(
      parseInt(req.params.id), req.user.id, req.params.cardId
    );
    res.json({ success: true, data: deck });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await deckService.delete(parseInt(req.params.id), req.user.id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const validate = async (req, res) => {
  try {
    const result = await deckService.validate(parseInt(req.params.id));
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

module.exports = { getPublicDecks, getMyDecks, getById, create, addCards, removeCard, remove, validate };
