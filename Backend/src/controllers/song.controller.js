const Song = require('../models/song.model');
const { uploadFile , uploadFromUrl } = require('../services/storage.service');

const createSong  = async (req, res) => {
    try {
        const { title, artist, mood, audioUrl} = req.body;
        let audioLink = '';
    
        if (req.file) {
            const fileData = await uploadFile(req.file);
            audioLink = fileData.url;
        } else if (audioUrl) {
            const fileData = await uploadFromUrl(audioUrl);
            audioLink = fileData.url;
        } else {
            return res.status(400).json({ error: "Audio file or audioUrl is required" });
        }

        const song = await Song.create({ title, artist, mood, audio: audioLink, user: req.user._id });
        res.status(201).json(song);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}
const getSongs = async (req, res ) => {
    const {mood} = req.query;
    
    try {
        const songs = await Song.find({ mood});
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    createSong,
    getSongs
}