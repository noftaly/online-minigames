import { Router } from 'express';
import serversManager from '../controllers/serversManager';
import updateHub from '../controllers/updateHub';
import Server from '../models/server';

const router = new Router();

router.post('/:type', async (req, res) => {
  if (![0, 1].includes(Number.parseInt(req.params.type, 10)))
    return res.redirect(400, '/');

  const doc = await Server.create({ game: Number.parseInt(req.params.type, 10) });
  serversManager.addNewId(doc.serverId);

  updateHub();

  res.redirect(303, '/');
});

export default router;
