import { ERROR_STATUS } from '../constants/STATUS_CODE';
import { Region, RegionModel, User, UserModel } from '../db/models';
import CustomError from '../errors/error';
import exportToCsv from '../utils/exportToCsv';

const exportUsers = async () => {
  const users = await UserModel.find();

  if (!users.length) {
    throw new CustomError({
      name: ERROR_STATUS.NOT_FOUND.name,
      statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
      message: 'Unable to export as there are no registered users',
    });
  }

  const fields = ['_id', 'name', 'email', 'address', 'coordinates', 'createdAt', 'updatedAt'];

  await exportToCsv<User[]>(users, 'users', fields);

  return { message: 'Successfully exported users' };
};

const exportRegions = async () => {
  const regions = await RegionModel.find();

  if (!regions.length) {
    throw new CustomError({
      name: ERROR_STATUS.NOT_FOUND.name,
      statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
      message: 'Unable to export as there are no regions registered',
    });
  }

  const fields = ['_id', 'name', 'coordinates', 'user', 'createdAt', 'updatedAt'];

  await exportToCsv<Region[]>(regions, 'regions', fields);

  return { message: 'Successfully exported regions' };
};

export default {
  exportUsers,
  exportRegions,
};
