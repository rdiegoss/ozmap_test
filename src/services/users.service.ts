import { UserModel } from '../db/models';
import geoLibIntegration from './geoLib.integration';
import { NewUser, UserRequestBody } from '../types/user.types';
import formatAddress from '../utils/formatAddress';
import CustomError from '../errors/error';
import { ERROR_STATUS } from '../constants/STATUS_CODE';

const getAll = async (page: number, limit: number) => {
  const [users, total] = await Promise.all([
    UserModel.find()
      .limit(limit)
      .skip((page - 1) * limit),
    UserModel.count(),
  ]);

  if (!users.length) {
    throw new CustomError({
      name: ERROR_STATUS.NOT_FOUND.name,
      statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
      message: 'There are no registered users in this range',
    });
  }

  return { message: 'Users successfully obtained', data: users, page, limit, total };
};

const getById = async (id: string) => {
  const user = await UserModel.findOne({ _id: id }).populate('regions');

  if (!user) {
    throw new CustomError({
      name: ERROR_STATUS.NOT_FOUND.name,
      statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
      message: `No users were found with the id ${id}`,
    });
  }

  return { message: 'Users successfully obtained', data: user };
};

const updateById = async (id: string, update: UserRequestBody) => {
  const user = await UserModel.findOne({ _id: id });

  if (!user) {
    throw new CustomError({
      name: ERROR_STATUS.NOT_FOUND.name,
      statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
      message: `No users were found with the id ${id}`,
    });
  }

  const newUser: NewUser = { name: update.name, email: update.email };

  if (update.address) {
    const { lat, lng } = await geoLibIntegration.getCoordinatesFromAddress(update.address.zipCode);
    const formatedAddress = formatAddress(update.address);

    newUser.coordinates = [lng, lat];
    newUser.address = formatedAddress;
  }

  if (update.coordinates) {
    const address = await geoLibIntegration.getAddressFromCoordinates(update.coordinates);

    newUser.address = address;
    newUser.coordinates = [update.coordinates.lng, update.coordinates.lat];
  }

  await UserModel.updateOne({ _id: id }, newUser);

  return { message: 'User updated successfully' };
};

const create = async (user: UserRequestBody) => {
  const verifyNewUser = await UserModel.findOne({ email: user.email });

  if (verifyNewUser) {
    throw new CustomError({
      name: ERROR_STATUS.UNPROCESSABLE_ENTITY.name,
      statusCode: ERROR_STATUS.UNPROCESSABLE_ENTITY.statusCode,
      message: 'Email already registered',
    });
  }

  const newUser: NewUser = {
    name: user.name,
    email: user.email,
  };

  if (user.address) {
    const { lat, lng } = await geoLibIntegration.getCoordinatesFromAddress(user.address.zipCode);
    const formatedAddress = formatAddress(user.address);

    newUser.coordinates = [lng, lat];
    newUser.address = formatedAddress;
  }

  if (user.coordinates) {
    const address = await geoLibIntegration.getAddressFromCoordinates(user.coordinates);

    newUser.address = address;
    newUser.coordinates = [user.coordinates.lng, user.coordinates.lat];
  }

  const result = await UserModel.create(newUser);

  return { message: 'User created successfully', data: result };
};

const deleteUser = async (id: string) => {
  const user = await UserModel.findByIdAndDelete({ _id: id });

  if (!user) {
    throw new CustomError({
      name: ERROR_STATUS.NOT_FOUND.name,
      statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
      message: `No users were found with the id ${id}`,
    });
  }
};

export default {
  getAll,
  getById,
  updateById,
  create,
  deleteUser,
};
