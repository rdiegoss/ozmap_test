import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai, { expect } from 'chai';
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import supertest from 'supertest';
import { RegionModel, UserModel } from '../../../src/db/models';
import geoLibIntegration from '../../../src/services/geoLib.integration';
import server from '../../../src/server';
import fs from 'fs/promises';
import exportService from '../../../src/services/export.service';
import CustomError from '../../../src/errors/error';
import { ERROR_STATUS } from '../../../src/constants/STATUS_CODE';

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

  it('Testing GET /export/users route', async function () {
    const response = await supertest(server).get('/export/users').expect(200);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.be.equal('Successfully exported users');
  });

  it('Testing GET /export/users route when throw error 404', async function () {
    sinon.stub(exportService, 'exportUsers').rejects(
      new CustomError({
        name: 'ExportError',
        message: 'Unable to export as there are no registered users',
        statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
      }),
    );

    const response = await supertest(server).get('/export/users').expect(404);

    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.be.equal('Unable to export as there are no registered users');
  });

  it('Testing GET /export/regions route', async function () {
    const response = await supertest(server).get('/export/regions').expect(200);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.be.equal('Successfully exported regions');
  });

  it('Testing GET /export/regions route when throw error 500', async function () {
    sinon.stub(fs, 'writeFile').throws();
    const response = await supertest(server).get('/export/regions').expect(500);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.be.equal('Unexpected error when mounting file');
  });
});
