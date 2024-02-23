import { Request, Response, NextFunction } from 'express';
import { regionSchema } from './joi.schemas';
import { RegionRequestBody } from '../types/region.types';
import CustomError from '../errors/error';
import { ERROR_STATUS } from '../constants/STATUS_CODE';

const validateRegion = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const region: RegionRequestBody = req.body;

    const { error } = regionSchema.validate(region);

    if (error) {
      throw new CustomError({
        name: ERROR_STATUS.UNPROCESSABLE_ENTITY.name,
        statusCode: ERROR_STATUS.UNPROCESSABLE_ENTITY.statusCode,
        message: error.message,
      });
    }

    if (typeof region?.coordinates?.lng === 'string' || typeof region?.coordinates?.lat === 'string') {
      throw new CustomError({
        name: ERROR_STATUS.UNPROCESSABLE_ENTITY.name,
        statusCode: ERROR_STATUS.UNPROCESSABLE_ENTITY.statusCode,
        message: 'Enter coordinates with latitude and longitude in numeric format',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default validateRegion;
