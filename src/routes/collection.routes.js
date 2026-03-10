const router = require('express').Router();
const ctrl = require('../controllers/collection.controller');
const { auth } = require('../middleware/auth');

router.get('/', auth, ctrl.getCollection);
router.get('/stats', auth, ctrl.getStats);
router.post('/bulk', auth, ctrl.bulkSet);
router.post('/:cardId', auth, ctrl.setStatus);
router.delete('/:cardId', auth, ctrl.remove);

module.exports = router;
