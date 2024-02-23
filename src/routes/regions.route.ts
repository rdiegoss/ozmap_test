import { Router } from 'express';
import regionsController from '../controllers/regions.controller';
import validateRegion from '../middlewares/validateRegion.middleware';

const router = Router();

router.get('/', regionsController.getAll);
router.get('/distance', regionsController.getByDistance);
router.get('/:id', regionsController.getById);
router.get('/:lng/:lat', regionsController.getSpecificPoint);
router.post('/', validateRegion, regionsController.create);
router.put('/:id', validateRegion, regionsController.update);
router.delete('/:id', regionsController.deleteRegion);

export default router;
