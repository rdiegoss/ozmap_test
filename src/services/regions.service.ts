import { ERROR_STATUS } from '../constants/STATUS_CODE';
import { RegionModel, UserModel } from '../db/models';
import CustomError from '../errors/error';
import { RegionRequestBody } from '../types/region.types';

const getAll = async (page: number, limit: number) => {
  const [regions, total] = await Promise.all([
    RegionModel.find()
      .limit(limit)
      .skip((page - 1) * limit),
    RegionModel.count(),
  ]);

  if (!regions.length) {
    throw new CustomError({
      name: ERROR_STATUS.NOT_FOUND.name,
      statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
      message: 'There is no region registered in this range',
    });
  }

  return { message: 'Successfully obtained regions', data: regions, page, limit, total };
};

const getById = async (id: string) => {
  const region = await RegionModel.findOne({ _id: id }).populate('user');

  if (!region) {
    throw new CustomError({
      name: ERROR_STATUS.NOT_FOUND.name,
      statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
      message: `No region was found with id ${id}`,
    });
  }

  return { message: 'Successfully obtained regions', data: region };
};

const getSpecificPoint = async (lng: number, lat: number) => {
  const regions = await RegionModel.find({
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
      },
    },
  }).populate('user');

  return { message: 'Successfully obtained regions', data: regions };
};

const getByDistance = async (lng: number, lat: number, distance: number, userId?: string) => {
  const regions = await RegionModel.find({
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        $maxDistance: distance,
      },
    },
  });

  if (!regions.length) {
    throw new CustomError({
      name: ERROR_STATUS.NOT_FOUND.name,
      statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
      message: 'No regions were found within this radius',
    });
  }

  if (userId) {
    const filteredRegions = regions.filter((region) => region.user === userId);

    if (!filteredRegions.length) {
      throw new CustomError({
        name: ERROR_STATUS.NOT_FOUND.name,
        statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
        message: 'No region belongs to this user',
      });
    }

    return { message: 'Successfully obtained regions', data: filteredRegions };
  }

  return { message: 'Successfully obtained regions', data: regions };
};

const create = async ({ name, coordinates, user }: RegionRequestBody) => {
  const hasUser = await UserModel.findById(user);

  if (!hasUser) {
    throw new CustomError({
      name: ERROR_STATUS.NOT_FOUND.name,
      statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
      message: 'No users were found with the id',
    });
  }

  const hasRegion = await RegionModel.findOne({ coordinates: [coordinates.lng, coordinates.lat] });

  if (hasRegion) {
    throw new CustomError({
      name: ERROR_STATUS.UNPROCESSABLE_ENTITY.name,
      statusCode: ERROR_STATUS.UNPROCESSABLE_ENTITY.statusCode,
      message: 'This region is already registered',
    });
  }

  const newRegion = await RegionModel.create({
    name,
    user,
    coordinates: [coordinates.lng, coordinates.lat],
  });

  return { message: 'Region created successfully', data: newRegion };
};

const update = async (region: RegionRequestBody, id: string) => {
  const hasRegion = await RegionModel.findOne({ _id: id });

  if (!hasRegion) {
    throw new CustomError({
      name: ERROR_STATUS.NOT_FOUND.name,
      statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
      message: `No region was found with id ${id}`,
    });
  }

  const hasUser = await UserModel.findOne({ _id: region.user });

  if (!hasUser) {
    throw new CustomError({
      name: ERROR_STATUS.UNPROCESSABLE_ENTITY.name,
      statusCode: ERROR_STATUS.UNPROCESSABLE_ENTITY.statusCode,
      message: 'Enter a valid user id',
    });
  }

  const userRegion = await UserModel.findOne({ regions: id });

  if (userRegion._id !== region.user) {
    await UserModel.updateOne({ _id: userRegion._id }, { $pull: { regions: id } });
    await UserModel.updateOne({ _id: region.user }, { $push: { regions: id } });
  }

  await RegionModel.updateOne(
    { _id: id },
    { name: region.name, coordinates: [region.coordinates.lng, region.coordinates.lat], user: region.user },
  );

  return { message: 'Region updated successfully' };
};

const deleteRegion = async (id: string) => {
  const verifyRegion = await RegionModel.findOne({ _id: id });

  if (!verifyRegion) {
    throw new CustomError({
      name: ERROR_STATUS.NOT_FOUND.name,
      statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
      message: `No region was found with id ${id}`,
    });
  }

  await UserModel.updateOne({ _id: verifyRegion.user }, { $pull: { regions: id } });
  await RegionModel.deleteOne({ _id: id });
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
