import { NextFunction, Request, Response } from 'express';
import { CustomErrorInterface } from '../errors/error';

const errorMiddleware = (error: CustomErrorInterface, _req: Request, res: Response, _next: NextFunction) => {
  const { statusCode = 500, message } = error;

  return res.status(statusCode).json({
    message,
  });
};

export default errorMiddleware;
