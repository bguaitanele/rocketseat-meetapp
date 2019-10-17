import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import UserController from './app/controllers/UserController';
import AuthController from './app/controllers/AuthController';
import auth from './app/middlewares/auth';

import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import SubscriptionController from './app/controllers/SubscriptionController';

const upload = multer(multerConfig);
const router = new Router();
router.get('/users', UserController.index);
router.post('/login', AuthController.store);
router.post('/users', UserController.store);

router.use(auth);

router.put('/users', UserController.update);

router.get('/meetups', MeetupController.index);
router.post('/meetups', MeetupController.store);
router.get('/meetups/:meetupId', MeetupController.get);
router.put('/meetups/:meetupId', MeetupController.update);
router.delete('/meetups/:meetupId', MeetupController.delete);

router.post('/meetups/:meetupId/subscription', SubscriptionController.store);
router.delete('/meetups/:meetupId/subscription', SubscriptionController.delete);
router.get('/subscriptions', SubscriptionController.index);

router.post('/files', upload.single('file'), FileController.store);

export default router;
