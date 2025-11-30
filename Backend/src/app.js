require('dotenv').config();
const express = require('express');
const connectToDb = require('./db/db');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const SongsRouter = require('./routes/song.routes');
const AuthRouter = require('./routes/auth.routes');

const app = express();
connectToDb();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(   
    {
        origin: 'https://mood-tunes-rose.vercel.app/',
        credentials: true
    }
));

app.use('/', SongsRouter)
app.use('/auth',AuthRouter)

module.exports = app;