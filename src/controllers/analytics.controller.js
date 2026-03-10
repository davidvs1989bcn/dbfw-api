// ============================================
// Controlador de analytics
// ============================================
const analyticsService = require('../services/analytics.service');

const topUsedCards = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const data = await analyticsService.topUsedCards(limit);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const topRatedCards = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const data = await analyticsService.topRatedCards(limit);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const colorDistribution = async (req, res) => {
  try {
    const data = await analyticsService.colorDistribution();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const platformStats = async (req, res) => {
  try {
    const data = await analyticsService.platformStats();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const setStats = async (req, res) => {
  try {
    const data = await analyticsService.setStats();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rarityDistribution = async (req, res) => {
  try {
    const data = await analyticsService.rarityDistribution();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const popularTags = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const data = await analyticsService.popularTags(limit);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const avgCostCurve = async (req, res) => {
  try {
    const data = await analyticsService.avgCostCurve();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  topUsedCards, topRatedCards, colorDistribution,
  platformStats, setStats, rarityDistribution,
  popularTags, avgCostCurve
};
