import sinon from 'sinon';
import { NextFunction, Request, Response } from 'express';
import sinonChai from 'sinon-chai';
import chai, { expect } from 'chai';
import CustomError from '../../../src/errors/error';
import validateRegion from '../../../src/middlewares/validateRegion.middleware';

chai.use(sinonChai);

describe('Testing validateRegion middleware', function () {
  const req = {} as Request;
  const res = {} as Response;
  let nextFunction: NextFunction;

  beforeEach(function () {
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);

    nextFunction = sinon.spy() as NextFunction;
  });

  it('Testing body request without coordinates', async function () {
    req.body = {
      name: 'Test',
      user: '6556ec440f88926eec7b0acf',
    };

    validateRegion(req, res, nextFunction);

    expect(nextFunction).to.have.been.calledWith(sinon.match.instanceOf(CustomError));
    expect(nextFunction).to.have.been.calledWith(sinon.match.has('statusCode', 422));
    expect(nextFunction).to.have.been.calledWith(sinon.match.has('message', 'The "coordinates" field is required'));
  });

  it('Testing body with invalid coordinates', async function () {
    req.body = {
      name: 'Test',
      user: '6556ec440f88926eec7b0acf',
      coordinates: {
        lng: '123',
        lat: '123',
      },
    };

    validateRegion(req, res, nextFunction);

    expect(nextFunction).to.have.been.calledWith(sinon.match.instanceOf(CustomError));
    expect(nextFunction).to.have.been.calledWith(sinon.match.has('statusCode', 422));
    expect(nextFunction).to.have.been.calledWith(
      sinon.match.has('message', 'Enter coordinates with latitude and longitude in numeric format'),
    );
  });

  it('Testing with valid body', async function () {
    req.body = {
      name: 'Test',
      user: '6556ec440f88926eec7b0acf',
      coordinates: {
        lng: -23.561684,
        lat: -46.625378,
      },
    };

    validateRegion(req, res, nextFunction);

    expect(nextFunction).to.have.been.calledWith();
  });
});
