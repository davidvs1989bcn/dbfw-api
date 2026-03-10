// ============================================
// Controlador de sets
// ============================================
const setService = require('../services/set.service');

const getAll = async (req, res) => {
  try {
    const sets = await setService.getAll();
    res.json({ success: true, data: sets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const set = await setService.getById(req.params.id);
    res.json({ success: true, data: set });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const set = await setService.create(req.body);
    res.status(201).json({ success: true, data: set });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const set = await setService.update(req.params.id, req.body);
    res.json({ success: true, data: set });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await setService.delete(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
