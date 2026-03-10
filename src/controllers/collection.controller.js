const collectionService = require('../services/collection.service');

const getCollection = async (req, res) => {
  try {
    const filters = { status: req.query.status, set_id: req.query.set_id };
    const data = await collectionService.getUserCollection(req.user.id, filters);
    res.json({ success: true, data, total: data.length });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, message: e.message });
  }
};

const getStats = async (req, res) => {
  try {
    const data = await collectionService.getCollectionStats(req.user.id);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const setStatus = async (req, res) => {
  try {
    const { status, quantity, notes } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'status is required.' });
    const data = await collectionService.setCardStatus(req.user.id, req.params.cardId, status, quantity, notes);
    res.json({ success: true, data });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, message: e.message });
  }
};

const bulkSet = async (req, res) => {
  try {
    const { card_ids, status } = req.body;
    if (!card_ids || !status) return res.status(400).json({ success: false, message: 'card_ids and status required.' });
    const data = await collectionService.bulkSetStatus(req.user.id, card_ids, status);
    res.json({ success: true, data });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, message: e.message });
  }
};

const remove = async (req, res) => {
  try {
    const data = await collectionService.removeFromCollection(req.user.id, req.params.cardId);
    res.json({ success: true, data });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, message: e.message });
  }
};

module.exports = { getCollection, getStats, setStatus, bulkSet, remove };
