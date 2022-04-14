import { Router } from 'express';

const router = new Router();

router.get('/', async (_req, res) => {
  res.render('index');
});

export default router;
