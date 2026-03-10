// ============================================
// Controlador de ratings, tags y sinergias
// ============================================
const ratingService = require('../services/rating.service');
const { getPagination } = require('../utils/pagination');

// --- Ratings ---
const rateCard = async (req, res) => {
  try {
    const { score, comment } = req.body;
    if (!score) {
      return res.status(400).json({ success: false, message: 'score es obligatorio (1-5).' });
    }
    const result = await ratingService.rateCard(req.user.id, req.params.cardId, score, comment);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const getCardRatings = async (req, res) => {
  try {
    const pagination = getPagination(req.query);
    const result = await ratingService.getCardRatings(req.params.cardId, pagination);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteRating = async (req, res) => {
  try {
    const result = await ratingService.deleteRating(req.user.id, req.params.cardId);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

// --- Tags ---
const addTag = async (req, res) => {
  try {
    const { tag } = req.body;
    if (!tag) {
      return res.status(400).json({ success: false, message: 'tag es obligatorio.' });
    }
    const result = await ratingService.addTag(req.user.id, req.params.cardId, tag);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const removeTag = async (req, res) => {
  try {
    const result = await ratingService.removeTag(req.user.id, req.params.cardId, req.params.tag);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

// --- Sinergias ---
const addSynergy = async (req, res) => {
  try {
    const { card_id_1, card_id_2, description } = req.body;
    if (!card_id_1 || !card_id_2) {
      return res.status(400).json({
        success: false,
        message: 'card_id_1 y card_id_2 son obligatorios.'
      });
    }
    const result = await ratingService.addSynergy(req.user.id, card_id_1, card_id_2, description);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const voteSynergy = async (req, res) => {
  try {
    const result = await ratingService.voteSynergy(parseInt(req.params.id));
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

module.exports = { rateCard, getCardRatings, deleteRating, addTag, removeTag, addSynergy, voteSynergy };
