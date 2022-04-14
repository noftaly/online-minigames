import { Router } from 'express';
import updateHub from '../controllers/updateHub';
import Server from '../models/server';

const router = new Router();

router.get('/delete-all-servers', async (_req, res) => {
  await Server.deleteMany({});
  updateHub();
  res.redirect(303, '/');
});

export default router;
