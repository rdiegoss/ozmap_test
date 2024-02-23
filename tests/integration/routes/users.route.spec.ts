import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai, { expect } from 'chai';
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import supertest from 'supertest';
import { UserModel } from '../../../src/db/models';
import geoLibIntegration from '../../../src/services/geoLib.integration';
import server from '../../../src/server';

chai.use(sinonChai);

describe('Testing users route', function () {
  let user;
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

  it('Testing GET /users route', async function () {
    const response = await supertest(server).get('/users');

    expect(response).to.have.property('status', 200);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.be.an('array');
  });

  it('Testing GET /users/:id route', async function () {
    const response = await supertest(server).get(`/users/${user._id}`);

    expect(response).to.have.property('status', 200);
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.be.an('object');
  });

  it('Testing GET /users/:id route with invalid id', async function () {
    const response = await supertest(server).get('/users/123123');

    expect(response).to.have.property('status', 404);
    expect(response.body).to.have.property('message');
  });

  it('Testing PUT /users/:id route', async function () {
    const response = await supertest(server)
      .put(`/users/${user._id}`)
      .send({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        address: {
          street: faker.location.street(),
          number: faker.location.buildingNumber(),
          neighborhood: faker.lorem.slug(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: faker.location.country(),
        },
      });

    expect(response).to.have.property('status', 201);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.be.equal('User updated successfully');
  });

  it('Testing PUT /users/:id route with invalid id', async function () {
    const response = await supertest(server)
      .put('/users/123123')
      .send({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        address: {
          street: faker.location.street(),
          number: faker.location.buildingNumber(),
          neighborhood: faker.lorem.slug(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: faker.location.country(),
        },
      });

    expect(response).to.have.property('status', 404);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.be.equal('No users were found with the id 123123');
  });

  it('Testing POST /users route', async function () {
    const newUser = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      address: {
        street: faker.location.street(),
        number: faker.location.buildingNumber(),
        neighborhood: faker.lorem.slug(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country(),
      },
    };

    const response = await supertest(server).post('/users').send(newUser);

    expect(response).to.have.property('status', 201);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.be.equal('User created successfully');
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.be.an('object');
    expect(response.body.data).to.have.property('name', newUser.name);
  });

  it('Testing DELETE /users/:id route', async function () {
    const response = await supertest(server).delete(`/users/${user._id}`);

    expect(response).to.have.property('status', 204);
  });
});
