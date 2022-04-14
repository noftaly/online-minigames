import path from 'node:path';

import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';

import serversManager from './controllers/serversManager';
import Server from './models/server';
import { createServer, debug, games, home } from './routes';
import { app } from './server';

import './controllers/socketsEvent';

mongoose.connect('mongodb://localhost:27017/online-minigames');
mongoose.connection.on('error', (err) => {
  console.error(err);
  throw new Error('MongoDB connection error. Please make sure MongoDB is running.');
});

Server.find().then((ids) => {
  serversManager.usedIds = ids.map(elt => elt.serverId);
});

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public/')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compression());
// app.use(helmet());
app.use(cookieParser());
app.use(morgan('dev'));
app.disable('x-powered-by');

app.use('/create', createServer);
app.use('/debug', debug);
app.use('/games', games);
app.use('/', home);

app.use((_req, res) => res.redirect(301, '/'));
