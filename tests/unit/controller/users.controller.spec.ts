import sinon from 'sinon';
import { NextFunction, Request, Response } from 'express';
import sinonChai from 'sinon-chai';
import chai, { expect } from 'chai';
import usersController from '../../../src/controllers/users.controller';
import usersService from '../../../src/services/users.service';
import usersMock from '../../mocks/users.mock';
import { BeAnObject, IObjectWithTypegooseFunction } from '@typegoose/typegoose/lib/types';
import { Document } from 'mongoose';
import { User } from '../../../src/db/models';
import CustomError from '../../../src/errors/error';
import { ERROR_STATUS } from '../../../src/constants/STATUS_CODE';

chai.use(sinonChai);

export type UserTestType = {
  message: string;
  data: Document<unknown, BeAnObject, User> &
    Omit<User & Required<{ _id: string }>, 'typegooseName'> &
    IObjectWithTypegooseFunction;
};

export type UsersTestType = {
  message: string;
  data: (Document<unknown, BeAnObject, User> &
    Omit<User & Required<{ _id: string }>, 'typegooseName'> &
    IObjectWithTypegooseFunction)[];
  page: number;
  limit: number;
  total: number;
};

describe('Testing users controller', function () {
  const req = {} as Request;
  const res = {} as Response;
  let nextFunction: NextFunction;

  beforeEach(function () {
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);

    nextFunction = sinon.spy() as NextFunction;

    sinon.restore();
  });

  describe('Testing getAll', function () {
    it('Testing when returns statusCode 200', async function () {
      req.query = {
        page: '1',
        limit: '10',
      };

      sinon.stub(usersService, 'getAll').resolves(usersMock.getAllMock as UsersTestType);

      await usersController.getAll(req, res, nextFunction);

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith(usersMock.getAllMock);
    });

    it('Testing when no users are registered', async function () {
      req.query = {
        page: '1',
        limit: '10',
      };

      sinon.stub(usersService, 'getAll').rejects(
        new CustomError({
          name: ERROR_STATUS.NOT_FOUND.name,
          statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
          message: 'There are no registered users in this range',
        }),
      );

      await usersController.getAll(req, res, nextFunction);

      expect(nextFunction).to.have.been.calledWith(sinon.match.instanceOf(CustomError));
      expect(nextFunction).to.have.been.calledWith(sinon.match.has('statusCode', 404));
      expect(nextFunction).to.have.been.calledWith(
        sinon.match.has('message', 'There are no registered users in this range'),
      );
    });
  });

  describe('Testing getById', function () {
    it('Testing when returns statusCode 200', async function () {
      req.params = {
        id: '6556ec440f88926eec7b0acf',
      };

      sinon
        .stub(usersService, 'getById')
        .resolves({ message: 'Users successfully obtained', data: usersMock.user } as UserTestType);

      await usersController.getById(req, res, nextFunction);

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({
        message: 'Users successfully obtained',
        data: usersMock.user,
      } as UserTestType);
    });

    it('Testing when user is not found', async function () {
      req.params = {
        id: '6556ec',
      };

      sinon.stub(usersService, 'getById').rejects(
        new CustomError({
          name: ERROR_STATUS.NOT_FOUND.name,
          statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
          message: `No users were found with the id ${req.params.id}`,
        }),
      );

      await usersController.getById(req, res, nextFunction);

      expect(nextFunction).to.have.been.calledWith(sinon.match.instanceOf(CustomError));
      expect(nextFunction).to.have.been.calledWith(sinon.match.has('statusCode', 404));
      expect(nextFunction).to.have.been.calledWith(
        sinon.match.has('message', `No users were found with the id ${req.params.id}`),
      );
    });

    describe('Testing updateById', function () {
      it('Testing when returns statusCode 201', async function () {
        req.params = {
          id: '6556ec440f88926eec7b0acf',
        };

        req.body = {
          name: 'Test',
          email: 'teste@test.com',
          coordinates: {
            lat: '-4.5',
            lng: '1.2',
          },
        };

        sinon.stub(usersService, 'updateById').resolves({ message: 'User updated successfully' });

        await usersController.updateById(req, res, nextFunction);

        expect(res.status).to.have.been.calledWith(201);
        expect(res.json).to.have.been.calledWith({ message: 'User updated successfully' });
      });

      it('Testing when user is not found', async function () {
        req.params = {
          id: '6556ec',
        };

        req.body = {
          name: 'Test',
          email: 'teste@test.com',
          coordinates: {
            lat: '-4.5',
            lng: '1.2',
          },
        };

        sinon.stub(usersService, 'updateById').rejects(
          new CustomError({
            name: ERROR_STATUS.NOT_FOUND.name,
            statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
            message: `No users were found with the id ${req.params.id}`,
          }),
        );

        await usersController.updateById(req, res, nextFunction);

        expect(nextFunction).to.have.been.calledWith(sinon.match.instanceOf(CustomError));
        expect(nextFunction).to.have.been.calledWith(sinon.match.has('statusCode', 404));
        expect(nextFunction).to.have.been.calledWith(
          sinon.match.has('message', `No users were found with the id ${req.params.id}`),
        );
      });
    });

    describe('Testing create', function () {
      it('Testing when returns statusCode 201', async function () {
        req.body = {
          name: 'Test',
          email: 'teste@test.com',
          coordinates: {
            lat: '-4.5',
            lng: '1.2',
          },
        };

        sinon
          .stub(usersService, 'create')
          .resolves({ message: 'User created successfully', data: usersMock.user } as UserTestType);

        await usersController.create(req, res, nextFunction);

        expect(res.status).to.have.been.calledWith(201);
        expect(res.json).to.have.been.calledWith({ message: 'User created successfully', data: usersMock.user });
      });

      it('Testing when user already exist', async function () {
        req.body = {
          name: 'Test',
          email: 'teste@test.com',
          coordinates: {
            lat: '-4.5',
            lng: '1.2',
          },
        };

        sinon.stub(usersService, 'create').rejects(
          new CustomError({
            name: ERROR_STATUS.UNPROCESSABLE_ENTITY.name,
            statusCode: ERROR_STATUS.UNPROCESSABLE_ENTITY.statusCode,
            message: 'Email already registered',
          }),
        );

        await usersController.create(req, res, nextFunction);

        expect(nextFunction).to.have.been.calledWith(sinon.match.instanceOf(CustomError));
        expect(nextFunction).to.have.been.calledWith(sinon.match.has('statusCode', 422));
        expect(nextFunction).to.have.been.calledWith(sinon.match.has('message', 'Email already registered'));
      });
    });

    describe('Testing deleteUser', function () {
      it('Testing when returns statusCode 204', async function () {
        req.params = {
          id: '6556ec440f88926eec7b0acf',
        };

        sinon.stub(usersService, 'deleteUser').resolves(null);

        await usersController.deleteUser(req, res, nextFunction);

        expect(res.status).to.have.been.calledWith(204);
      });

      it('Testing when user is not found', async function () {
        req.params = {
          id: '6556ec',
        };

        sinon.stub(usersService, 'deleteUser').rejects(
          new CustomError({
            name: ERROR_STATUS.NOT_FOUND.name,
            statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
            message: `No users were found with the id ${req.params.id}`,
          }),
        );

        await usersController.deleteUser(req, res, nextFunction);

        expect(nextFunction).to.have.been.calledWith(sinon.match.instanceOf(CustomError));
        expect(nextFunction).to.have.been.calledWith(sinon.match.has('statusCode', 404));
        expect(nextFunction).to.have.been.calledWith(
          sinon.match.has('message', `No users were found with the id ${req.params.id}`),
        );
      });
    });
  });
});
