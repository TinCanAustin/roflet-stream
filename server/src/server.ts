import express from 'express';
import cors from 'cors';
import session from 'express-session';
import authRouter from './route/auth.ts';
import songsRouter from './route/song.ts';

const HOUR_VAR = 60000 * 60;

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(session({
    secret: `${process.env.SECRET}`,
    saveUninitialized: false,
    resave: false,
    cookie:{
        maxAge: HOUR_VAR,
        httpOnly: true,
        sameSite: "none",
        secure: false
    }
}));
app.set('trust proxy', 1);

app.use('/auth', authRouter);
app.use('/songs', songsRouter);

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
});
