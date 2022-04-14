import Server from '../models/server';
import { io } from '../server';
import updateHub from './updateHub';

export default function handleSocketsEvents(socket) {
  // Tic Tac Toe
  socket.on('game:ttt:connected', async (data) => {
    socket.serverId = data.serverId;
    const { serverId } = socket; // Just to use object shorthand in mongodb's queries

    socket.join(serverId);

    const serverInfos = await Server.findOneAndUpdate(
      { serverId },
      { $inc: { connections: 1 }, $push: { clients: socket.id } },
      { new: true }, // Return the updated document
    );
    updateHub();

    const players = ['X', 'O'];

    socket.emit('game:ttt:welcome', { player: players[serverInfos.connections - 1] });
    console.log(`INFO: We have a new client ${socket.id} for server ${socket.serverId} (${['tictactoe', 'connect4'][serverInfos.game]}) (${serverInfos.connections}/${serverInfos.maxPlayers}).`);

    if (serverInfos.connections === serverInfos.maxPlayers) {
      console.log(`INFO: Enough players for server ${socket.serverId} (${['tictactoe', 'connect4'][serverInfos.game]}), starting.`);
      await Server.updateOne({ serverId }, { $inc: { stage: 1 } });
      io.in(serverId).emit('game:ttt:start');
      updateHub();
    }
  });

  socket.on('game:ttt:nextPlayer', (data) => {
    // We emit to the other player (.emit() does not include sender)
    socket.to(socket.serverId).emit('game:ttt:yourTurn', data);
  });

  socket.on('game:ttt:endGameWin', (data) => {
    socket.to(socket.serverId).emit('game:ttt:gameEndLose', data);
  });

  socket.on('game:ttt:endGameDraw', (data) => {
    socket.to(socket.serverId).emit('game:ttt:gameEndDraw', data);
  });


  // Connect 4
  socket.on('game:c4:connected', async (data) => {
    socket.serverId = data.serverId;
    const { serverId } = socket; // Just to use object shorthand in mongodb's queries

    socket.join(serverId);

    const serverInfos = await Server.findOneAndUpdate(
      { serverId },
      { $inc: { connections: 1 }, $push: { clients: socket.id } },
      { new: true }, // Return the updated document
    );
    updateHub();

    const players = ['R', 'Y'];

    socket.emit('game:c4:welcome', { player: players[serverInfos.connections - 1] });
    console.log(`INFO: We have a new client ${socket.id} for server ${socket.serverId} (${serverInfos.connections}/${serverInfos.maxPlayers}).`);

    if (serverInfos.connections === serverInfos.maxPlayers) {
      console.log(`INFO: Enough players for server ${socket.serverId}, starting.`);
      await Server.updateOne({ serverId }, { $inc: { stage: 1 } });
      io.in(serverId).emit('game:c4:start');
      updateHub();
    }
  });

  socket.on('game:c4:nextPlayer', (data) => {
    // We emit to the other player (.emit() does not include sender)
    socket.to(socket.serverId).emit('game:c4:yourTurn', data);
  });

  socket.on('game:c4:endGameWin', (data) => {
    socket.to(socket.serverId).emit('game:c4:gameEndLose', data);
  });

  socket.on('game:c4:endGameDraw', (data) => {
    socket.to(socket.serverId).emit('game:c4:gameEndDraw', data);
  });

  // Chat
  socket.on('chat:game', (data) => {
    socket.to(socket.serverId).emit('chat:game', data);
  });

  socket.on('chat:hub', (data) => {
    io.in('__hub__').emit('chat:hub', data);
  });


  // Hub (server list update) events
  socket.on('hub:connected', () => {
    socket.join('__hub__');
    updateHub();
  });


  // Disconnect
  socket.on('disconnect', async () => {
    if (!socket.serverId) return; // He was not in a game server

    console.log(`INFO: We have a disconnect request from client ${socket.id} in server ${socket.serverId}`);
    const { serverId } = socket; // Just to use object shorthand

    const serverInfos = await Server.findOne({ serverId });
    if (!serverInfos) return;

    if (serverInfos.connections >= 2) {
      socket.to(serverId).emit('game:ttt:userDisconnected');
      socket.to(serverId).emit('game:c4:userDisconnected');
      await Server.findOneAndUpdate(
        { serverId },
        { $inc: { connections: -1 }, $pull: { clients: socket.id } },
      );
      console.log(`INFO: A client (not the last) of server ${serverId} (${['tictactoe', 'connect4'][serverInfos.game]}) has disonnected.`);
    } else {
      await Server.findOneAndUpdate(
        { serverId },
        { $set: { connections: 0, clients: [], stage: 0 } },
      );
      console.log(`INFO: The last client of server ${serverId} (${['tictactoe', 'connect4'][serverInfos.game]}) has disonnected.`);
    }
    updateHub();
  });
}

io.on('connection', handleSocketsEvents);
