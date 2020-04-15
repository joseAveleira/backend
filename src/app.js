const express = require('express');
const cors = require('cors');
const broker = require('./broker');
const authRouter = require('./routes/auth');
const matchRouter = require('./routes/match');
const scoreboardRouter = require('./routes/scoreboard');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/match', matchRouter);
app.use('/scoreboard', scoreboardRouter);

broker.listen();

// eslint-disable-next-line no-console
app.listen(8080, () => console.log('Servidor executando'));
