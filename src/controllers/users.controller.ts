import usersService from '../services/users.service';
import { NextFunction, Request, Response } from 'express';
import { UserRequestBody } from '../types/user.types';

const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const users = await usersService.getAll(Number(page), Number(limit));

    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await usersService.getById(id);

    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const update: UserRequestBody = req.body;

    const user = await usersService.updateById(id, update);

    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.body;
    const newUser = await usersService.create(user);

    return res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await usersService.deleteUser(id);

    return res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export default {
  getAll,
  getById,
  updateById,
  create,
  deleteUser,
};
