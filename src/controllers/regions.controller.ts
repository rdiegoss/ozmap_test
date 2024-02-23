import { NextFunction, Request, Response } from 'express';
import regionsService from '../services/regions.service';
import { RegionRequestBody } from '../types/region.types';

const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const regions = await regionsService.getAll(Number(page), Number(limit));

    return res.status(200).json(regions);
  } catch (error) {
    next(error);
  }
};

const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const region = await regionsService.getById(id);

    return res.status(200).json(region);
  } catch (error) {
    next(error);
  }
};

const getSpecificPoint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lng, lat } = req.params;

    const regions = await regionsService.getSpecificPoint(Number(lng), Number(lat));

    return res.status(200).json(regions);
  } catch (error) {
    next(error);
  }
};

const getByDistance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lng, lat, distance, user } = req.query;

    if (user) {
      const regions = await regionsService.getByDistance(
        Number(lng),
        Number(lat),
        Number(distance),
        String(user),
      );

      return res.status(200).json(regions);
    }

    const regions = await regionsService.getByDistance(Number(lng), Number(lat), Number(distance));

    return res.status(200).json(regions);
  } catch (error) {
    next(error);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const region: RegionRequestBody = req.body;

    const newRegion = await regionsService.create(region);

    return res.status(201).json(newRegion);
  } catch (error) {
    next(error);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const region: RegionRequestBody = req.body;
    const { id } = req.params;

    const updatedRegion = await regionsService.update(region, id);

    return res.status(201).json(updatedRegion);
  } catch (error) {
    next(error);
  }
};

const deleteRegion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await regionsService.deleteRegion(id);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export default {
  getAll,
  getById,
  getSpecificPoint,
  getByDistance,
  create,
  update,
  deleteRegion,
};
