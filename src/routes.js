import { Router } from 'express';
import UserController from './app/controllers/UserController';
import AuthController from './app/controllers/AuthController';
import auth from './app/middlewares/auth';

const router = new Router();
router.get('/users', UserController.index);
router.post('/login', AuthController.store);

router.use(auth);

router.post('/users', UserController.store);
router.put('/users', UserController.update);
export default router;
