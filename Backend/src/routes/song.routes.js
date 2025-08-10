const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createSong, getSongs } = require('../controllers/song.controller');
const authMiddleware = require('../middleware/auth.middleware');

const upload = multer({storage: multer.memoryStorage()});

router.post("/song", authMiddleware, upload.single('audio') , createSong);
router.get("/songs", getSongs);

module.exports = router;


