import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createUserSchema, updateUserSchema } from '../validators/users.validator.js';
import * as usersController from '../controllers/users.controller.js';

export const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.post('/', validate({ body: createUserSchema }), usersController.createOrUpdateUser);
usersRouter.get('/me', usersController.getMe);
usersRouter.patch('/me', validate({ body: updateUserSchema }), usersController.updateMe);
