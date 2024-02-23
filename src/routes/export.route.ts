import { Router } from 'express';
import exportController from '../controllers/export.controller';

const router = Router();

router.get('/users', exportController.exportUsers);
router.get('/regions', exportController.exportRegions);

export default router;
