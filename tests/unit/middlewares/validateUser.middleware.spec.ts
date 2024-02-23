import sinon from 'sinon';
import validateUser from '../../../src/middlewares/validateUser.middleware';
import { NextFunction, Request, Response } from 'express';
import sinonChai from 'sinon-chai';
import chai, { expect } from 'chai';
import CustomError from '../../../src/errors/error';

chai.use(sinonChai);

describe('Testing validateUser middleware', function () {
  const req = {} as Request;
  const res = {} as Response;
  let nextFunction: NextFunction;

  beforeEach(function () {
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);

    nextFunction = sinon.spy() as NextFunction;
  });

  it('Testing body request without coordinates and address', async function () {
    req.body = {
      name: 'Test',
      email: 'test@test.com',
    };

    validateUser(req, res, nextFunction);

    expect(nextFunction).to.have.been.calledWith(sinon.match.instanceOf(CustomError));
    expect(nextFunction).to.have.been.calledWith(sinon.match.has('statusCode', 422));
    expect(nextFunction).to.have.been.calledWith(
      sinon.match.has('message', 'Address or coordinates are required'),
    );
  });

  it('Testing body request with coordinates and address', async function () {
    req.body = {
      name: 'Test',
      email: 'test@test.com',
      address: {},
    };

    validateUser(req, res, nextFunction);

    expect(nextFunction).to.have.been.calledWith(sinon.match.instanceOf(CustomError));
    expect(nextFunction).to.have.been.calledWith(sinon.match.has('statusCode', 422));
    expect(nextFunction).to.have.been.calledWith(sinon.match.has('message', 'The "address.street" field is required'));
  });

  it('Testing with invalid coordinates', async function () {
    req.body = {
      name: 'Test',
      email: 'test@test.com',
      coordinates: {
        lat: '-4.5',
        lng: '1.2',
      },
    };

    validateUser(req, res, nextFunction);

    expect(nextFunction).to.have.been.calledWith(sinon.match.instanceOf(CustomError));
    expect(nextFunction).to.have.been.calledWith(sinon.match.has('statusCode', 422));
    expect(nextFunction).to.have.been.calledWith(
      sinon.match.has('message', 'Enter coordinates with latitude and longitude in numeric format'),
    );
  });

  it('Testing with valid body', async function () {
    req.body = {
      name: 'Test',
      email: 'test@test.com',
      coordinates: {
        lat: -4.5,
        lng: 1.2,
      },
    };
    validateUser(req, res, nextFunction);

    expect(nextFunction).to.have.been.calledWith();
  });
});
