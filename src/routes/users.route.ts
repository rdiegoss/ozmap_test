import { Router } from 'express';
import usersController from '../controllers/users.controller';
import validateUser from '../middlewares/validateUser.middleware';

const router = Router();

router.get('/', usersController.getAll);
router.get('/:id', usersController.getById);
router.put('/:id', validateUser, usersController.updateById);
router.post('/', validateUser, usersController.create);
router.delete('/:id', usersController.deleteUser);

export default router;
