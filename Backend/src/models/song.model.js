const mongoose = require("mongoose");


const songSchema = new mongoose.Schema({
    title: String,
    artist: String,
    mood: String,
    audio: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
})

module.exports = mongoose.model("Song", songSchema);