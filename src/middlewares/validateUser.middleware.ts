import { NextFunction, Request, Response } from 'express';
import { userSchema } from './joi.schemas';
import { UserRequestBody } from '../types/user.types';
import CustomError from '../errors/error';
import { ERROR_STATUS } from '../constants/STATUS_CODE';

const validateUser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const user: UserRequestBody = req.body;

    if (!user?.coordinates && !user?.address) {
      throw new CustomError({
        name: ERROR_STATUS.UNPROCESSABLE_ENTITY.name,
        statusCode: ERROR_STATUS.UNPROCESSABLE_ENTITY.statusCode,
        message: 'Address or coordinates are required',
      });
    }

    const { error } = userSchema.validate(user);

    if (error) {
      throw new CustomError({
        name: ERROR_STATUS.UNPROCESSABLE_ENTITY.name,
        statusCode: ERROR_STATUS.UNPROCESSABLE_ENTITY.statusCode,
        message: error.message,
      });
    }

    if (typeof user?.coordinates?.lng === 'string' || typeof user?.coordinates?.lat === 'string') {
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

export default validateUser;
