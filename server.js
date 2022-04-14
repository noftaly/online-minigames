import { createServer } from 'node:http';
import express from 'express';
import { Server } from 'socket.io';

export const app = express();

const server = createServer(app);

export const io = new Server(server);

server.listen(5000, () => console.log('App is running on port 5000'));
