import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import CustomError from '../../../src/errors/error';
import usersService from '../../../src/services/users.service';
import { UserModel } from '../../../src/db/models';
import usersMock from '../../mocks/users.mock';
import regionsMock from '../../mocks/regions.mock';
import geoLibIntegration from '../../../src/services/geoLib.integration';

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Testing user service', function () {
  beforeEach(function () {
    sinon.restore();
  });

  describe('Testin getAll function', function () {
    it('Testing with users registered', async function () {
      sinon
        .mock(UserModel)
        .expects('find')
        .returns({
          limit: sinon.stub().returns({
            skip: sinon.stub().resolves([usersMock.users]),
          }),
        });

      sinon.stub(UserModel, 'count').resolves(1);

      const serviceResponse = await usersService.getAll(1, 10);

      expect(serviceResponse).to.be.an('object');
      expect(serviceResponse).to.have.property('message');
      expect(serviceResponse.message).to.be.equal('Users successfully obtained');
      expect(serviceResponse).to.have.property('data');
      expect(serviceResponse).to.have.property('page');
      expect(serviceResponse).to.have.property('limit');
      expect(serviceResponse).to.have.property('total');
    });

    it('Testing without users registered', async function () {
      sinon
        .mock(UserModel)
        .expects('find')
        .returns({
          limit: sinon.stub().returns({
            skip: sinon.stub().resolves([]),
          }),
        });

      sinon.stub(UserModel, 'count').resolves(0);

      await expect(usersService.getAll(1, 10)).to.be.rejectedWith(
        CustomError,
        'There are no registered users in this range',
      );
    });
  });

  describe('Testing getById function', function () {
    it('Testing with a existing user', async function () {
      sinon
        .mock(UserModel)
        .expects('findOne')
        .returns({
          populate: sinon.stub().resolves({ ...usersMock.user, regions: [regionsMock.region] }),
        });

      const serviceResponse = await usersService.getById(usersMock.user._id);

      expect(serviceResponse).to.be.an('object');
      expect(serviceResponse).to.have.property('message');
      expect(serviceResponse.message).to.be.equal('Users successfully obtained');
      expect(serviceResponse).to.have.property('data');
      expect(serviceResponse.data).to.be.deep.equal(usersMock.user);
    });

    it('Testing with a non-existing user', async function () {
      sinon
        .mock(UserModel)
        .expects('findOne')
        .returns({
          populate: sinon.stub().resolves(null),
        });

      await expect(usersService.getById('1')).to.be.rejectedWith(
        CustomError,
        'No users were found with the id 1',
      );
    });
  });

  describe('Testing updateById function', function () {
    it('Testing with invalid id', async function () {
      sinon.stub(UserModel, 'findOne').resolves(null);
      await expect(usersService.updateById('1', usersMock.userRequestBody)).to.be.rejectedWith(
        CustomError,
        'No users were found with the id 1',
      );
    });

    it('Testing with valid id and coordinates', async function () {
      sinon.stub(UserModel, 'findOne').resolves(usersMock.user);
      sinon.stub(geoLibIntegration, 'getAddressFromCoordinates').resolves(usersMock.user.address);
      sinon.stub(UserModel, 'updateOne').resolves(null);

      const serviceResponse = await usersService.updateById('1', usersMock.userRequestBody);

      expect(serviceResponse).to.be.an('object');
      expect(serviceResponse).to.have.property('message');
      expect(serviceResponse.message).to.be.equal('User updated successfully');
    });

    it('Testing with valid id and address', async function () {
      sinon.stub(UserModel, 'findOne').resolves(usersMock.user);
      sinon.stub(geoLibIntegration, 'getCoordinatesFromAddress').resolves({
        lat: usersMock.user.coordinates[1],
        lng: usersMock.user.coordinates[0],
      });
      sinon.stub(UserModel, 'updateOne').resolves(null);

      const serviceResponse = await usersService.updateById('1', usersMock.userRequestBody2);

      expect(serviceResponse).to.be.an('object');
      expect(serviceResponse).to.have.property('message');
      expect(serviceResponse.message).to.be.equal('User updated successfully');
    });
  });

  describe('Testing create function', function () {
    it('Testing with a email already in use', async function () {
      sinon.stub(UserModel, 'findOne').resolves(usersMock.user);
      await expect(usersService.create(usersMock.userRequestBody)).to.be.rejectedWith(
        CustomError,
        'Email already registered',
      );
    });

    it('Testing with valid email and body request with an address ', async function () {
      sinon.stub(UserModel, 'findOne').resolves(null);
      sinon.stub(geoLibIntegration, 'getCoordinatesFromAddress').resolves({
        lat: usersMock.user.coordinates[1],
        lng: usersMock.user.coordinates[0],
      });
      sinon.stub(UserModel, 'create').resolves(usersMock.user as any);

      const serviceResponse = await usersService.create(usersMock.userRequestBody2);

      expect(serviceResponse).to.be.an('object');
      expect(serviceResponse).to.have.property('message');
      expect(serviceResponse.message).to.be.equal('User created successfully');
    });

    it('Testing with valid email and body request without an address number ', async function () {
      sinon.stub(UserModel, 'findOne').resolves(null);
      sinon.stub(geoLibIntegration, 'getCoordinatesFromAddress').resolves({
        lat: usersMock.user.coordinates[1],
        lng: usersMock.user.coordinates[0],
      });
      sinon.stub(UserModel, 'create').resolves(usersMock.user as any);

      const serviceResponse = await usersService.create(usersMock.userRequestBody3);

      expect(serviceResponse).to.be.an('object');
      expect(serviceResponse).to.have.property('message');
      expect(serviceResponse.message).to.be.equal('User created successfully');
    });

    it('Testing with a valid email and body request with coordinates', async function () {
      sinon.stub(UserModel, 'findOne').resolves(null);
      sinon.stub(geoLibIntegration, 'getAddressFromCoordinates').resolves(usersMock.user.address);
      sinon.stub(UserModel, 'create').resolves(usersMock.user as any);

      const serviceResponse = await usersService.create(usersMock.userRequestBody);

      expect(serviceResponse).to.be.an('object');
      expect(serviceResponse).to.have.property('message');
      expect(serviceResponse.message).to.be.equal('User created successfully');
    });

    describe('Testing deleteUser function', function () {
      it('Testing with a invalid id', async function () {
        sinon.stub(UserModel, 'findByIdAndDelete').resolves(null);

        await expect(usersService.deleteUser('1')).to.be.rejectedWith(
          CustomError,
          'No users were found with the id 1',
        );
      });

      it('Testing with a valid id', async function () {
        sinon.stub(UserModel, 'findByIdAndDelete').resolves(usersMock.user);

        expect(() => usersService.deleteUser('6558f3eaabd3c88df1a63b72')).to.not.have.throw();
      });
    });
  });
});
