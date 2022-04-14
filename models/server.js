import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

import serversManager from '../controllers/serversManager';

const TICTACTOE = 0;
const CONNECT4 = 1;

const serverSchema = new mongoose.Schema({
  serverId: {
    type: String,
    required: true,
    default: () => {
      let id = nanoid(6);
      while (serversManager.getUsedIds().includes(id))
        id = nanoid(6);
      return id;
    },
  },
  game: {
    type: Number,
    enum: [TICTACTOE, CONNECT4],
    required: true,
  },
  maxPlayers: {
    type: Number,
    required: true,
    default() {
      switch (this.game) {
        case TICTACTOE:
        case CONNECT4:
          return 2;
        default:
          return 0;
      }
    },
  },
  link: {
    type: String,
    required: true,
    default() {
      return `http://localhost:5000/games/${this.serverId}`;
    },
  },
  stage: {
    type: Number,
    required: true,
    default: 0,
  },
  connections: {
    type: Number,
    required: true,
    default: 0,
  },
  clients: {
    type: Array,
    required: true,
    default: [],
  },
}, { timestamps: true });

export default mongoose.model('Server', serverSchema);
