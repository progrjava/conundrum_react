const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const GameController = require('../controllers/GameController');

router.post('/generate-game', upload.single('file-upload'), GameController.generateGame);
router.post('/recalculate-game-layout', express.json(), GameController.recalculateLayout);
router.post('/track-activity', (req, res) => {
    res.status(200).json({ message: 'Activity tracked' });
});

module.exports = router;