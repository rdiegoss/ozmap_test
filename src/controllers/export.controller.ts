import { NextFunction, Request, Response } from 'express';
import exportService from '../services/export.service';

const exportUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await exportService.exportUsers();

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

const exportRegions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const regions = await exportService.exportRegions();

    res.status(200).json(regions);
  } catch (error) {
    next(error);
  }
};

export default {
  exportUsers,
  exportRegions,
};
