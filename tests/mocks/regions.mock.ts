import { faker } from '@faker-js/faker';

const region = {
  _id: faker.database.mongodbObjectId(),
  name: faker.string.alpha(),
  user: faker.database.mongodbObjectId(),
  coordinates: [faker.location.longitude(), faker.location.latitude()],
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  __v: faker.number.int(),
};

const regions = {
  message: 'Successfully obtained regions',
  data: [region],
  page: 1,
  limit: 10,
  total: 1,
};

const regions2 = {
  message: 'There is no region registered in this range',
  data: [],
  page: 1,
  limit: 10,
  total: 1,
};

const regionPopulatedUser = {
  ...region,
  user: {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    _id: faker.database.mongodbObjectId(),
    regions: [region._id],
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    __v: faker.number.int(),
  },
};

const regionsByDistanceMock = [
  {
    _id: faker.database.mongodbObjectId(),
    name: faker.string.alpha(),
    user: '6558f3eaabd3c88df1a63b72',
    coordinates: [faker.location.longitude(), faker.location.latitude()],
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    __v: faker.number.int(),
  },
  {
    _id: faker.database.mongodbObjectId(),
    name: faker.string.alpha(),
    user: '6558f4c6abd3c88df1a63b75',
    coordinates: [faker.location.longitude(), faker.location.latitude()],
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    __v: faker.number.int(),
  },
];

const regionRequestBody = {
  name: faker.string.alpha(),
  coordinates: { lng: faker.location.longitude(), lat: faker.location.latitude() },
  user: faker.database.mongodbObjectId(),
};

export default {
  regions,
  region,
  regionPopulatedUser,
  regionsByDistanceMock,
  regionRequestBody,
  regions2,
};
