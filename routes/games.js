import { Router } from 'express';
import serversManager from '../controllers/serversManager';
import Server from '../models/server';

const router = new Router();

router.get('/:serverId', async (req, res) => {
  const { serverId } = req.params;

  if (serversManager.getUsedIds().includes(serverId)) {
    const serverInfos = await Server.findOne({ serverId });

    if (serverInfos.connections === serverInfos.maxPlayers)
      res.redirect(301, '/');
    else
      res.render('game', { type: serverInfos.game });
  } else {
    res.redirect(301, '/');
  }
});

export default router;
