import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai, { expect } from 'chai';
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import supertest from 'supertest';
import { RegionModel, UserModel } from '../../../src/db/models';
import geoLibIntegration from '../../../src/services/geoLib.integration';
import server from '../../../src/server';

chai.use(sinonChai);

describe('Testing regions route', function () {
  let user;
  let region;
  let session;
  const geoLibStub: Partial<typeof geoLibIntegration> = {};

  before(async () => {
    geoLibStub.getAddressFromCoordinates = sinon
      .stub(geoLibIntegration, 'getAddressFromCoordinates')
      .resolves(faker.location.streetAddress({ useFullAddress: true }));
    geoLibStub.getCoordinatesFromAddress = sinon
      .stub(geoLibIntegration, 'getCoordinatesFromAddress')
      .resolves({ lat: faker.location.latitude(), lng: faker.location.longitude() });

    session = await mongoose.startSession();
    user = await UserModel.create({
      name: faker.person.firstName(),
      email: faker.internet.email(),
      address: faker.location.streetAddress({ useFullAddress: true }),
    });

    region = await RegionModel.create({
      name: faker.string.alpha(),
      user: user._id,
      coordinates: [faker.location.longitude(), faker.location.latitude()],
    });
  });

  after(() => {
    sinon.restore();
    session.endSession();
  });

  beforeEach(() => {
    session.startTransaction();
  });

  afterEach(() => {
    session.commitTransaction();
  });

  it('Testing GET /regions route', async function () {
    const response = await supertest(server).get('/regions');

    expect(response).to.have.property('status', 200);
    expect(response).to.have.property('body');
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.be.an('array');
    expect(response.body.message).to.be.equal('Successfully obtained regions');
  });

  it('Testing GET /regions/:id route', async function () {
    const response = await supertest(server).get(`/regions/${region._id}`);

    expect(response).to.have.property('status', 200);
    expect(response).to.have.property('body');
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.be.an('object');
    expect(response.body.message).to.be.equal('Successfully obtained regions');
  });

  it('Testing GET /regions/:id route with invalid id', async function () {
    const response = await supertest(server).get('/regions/123');

    expect(response).to.have.property('status', 404);
    expect(response).to.have.property('body');
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.be.equal('No region was found with id 123');
  });

  it('Testing POST /regions route', async function () {
    const response = await supertest(server)
      .post('/regions')
      .send({
        name: faker.string.alpha(),
        user: user._id,
        coordinates: {
          lng: faker.location.longitude(),
          lat: faker.location.latitude(),
        },
      });

    expect(response).to.have.property('status', 201);
    expect(response).to.have.property('body');
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.be.an('object');
    expect(response.body.message).to.be.equal('Region created successfully');
  });

  it('Testing POST /regions route with invalid data', async function () {
    const response = await supertest(server)
      .post('/regions')
      .send({
        name: faker.string.alpha(),
        user: user._id,
        coordinates: {
          lng: faker.location.longitude(),
        },
      });

    expect(response).to.have.property('status', 422);
    expect(response).to.have.property('body');
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.be.equal('The "coordinates.lat" field is required');
  });

  it('Testing PUT /regions/:id route', async function () {
    const response = await supertest(server)
      .put(`/regions/${region._id}`)
      .send({
        name: faker.string.alpha(),
        user: user._id,
        coordinates: {
          lng: faker.location.longitude(),
          lat: faker.location.latitude(),
        },
      });

    expect(response).to.have.property('status', 201);
    expect(response).to.have.property('body');
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.be.equal('Region updated successfully');
  });

  it('Testing PUT /regions/:id route with invalid region id', async function () {
    const response = await supertest(server)
      .put(`/regions/123`)
      .send({
        name: faker.string.alpha(),
        user: user._id,
        coordinates: {
          lng: faker.location.longitude(),
          lat: faker.location.latitude(),
        },
      });

    expect(response).to.have.property('status', 404);
    expect(response).to.have.property('body');
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.be.equal('No region was found with id 123');
  });

  it('Testing GET /regions/:lng/:lat route', async function () {
    const response = await supertest(server).get(`/regions/${region.coordinates[0]}/${region.coordinates[1]}`);

    expect(response).to.have.property('status', 200);
    expect(response).to.have.property('body');
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.be.an('array');
    expect(response.body.message).to.be.equal('Successfully obtained regions');
  });

  it('Testing GET /regions/distance route with valid distance', async function () {
    const response = await supertest(server).get('/regions/distance?lng=-4.08&lat=-2.781&distance=10000000');

    expect(response).to.have.property('status', 200);
    expect(response).to.have.property('body');
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.be.an('array');
    expect(response.body.message).to.be.equal('Successfully obtained regions');
  });

  it('Testing GET /regions/distance route', async function () {
    const response = await supertest(server).get('/regions/distance?lng=-4.08&lat=-2.781&distance=100');

    expect(response).to.have.property('status', 404);
    expect(response).to.have.property('body');
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.be.equal('No regions were found within this radius');
  });

  it('Testing GET /regions/distance route filtering regions by user', async function () {
    const response = await supertest(server).get(
      `/regions/distance?lng=-4.08&lat=-2.781&distance=1000000000&user=${user._id}`,
    );

    expect(response).to.have.property('status', 200);
    expect(response).to.have.property('body');
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.be.an('array');
    expect(response.body.message).to.be.equal('Successfully obtained regions');
  });

  it('Testing DELETE /regions/:id route', async function () {
    const response = await supertest(server).delete(`/regions/${region._id}`);

    expect(response).to.have.property('status', 204);
  });
});
