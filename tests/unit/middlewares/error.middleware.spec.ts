import sinon from 'sinon';
import { NextFunction, Request, Response } from 'express';
import sinonChai from 'sinon-chai';
import chai, { expect } from 'chai';
import CustomError from '../../../src/errors/error';
import errorMiddleware from '../../../src/middlewares/error.middleware';
import { ERROR_STATUS } from '../../../src/constants/STATUS_CODE';

chai.use(sinonChai);

describe('Testing error middleware', function () {
  const req = {} as Request;
  const res = {} as Response;

  let nextFunction: NextFunction;

  beforeEach(function () {
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);

    nextFunction = sinon.spy() as NextFunction;
  });

  it('Testing with UNPROCESSABLE_ENTITY', async function () {
    const error = new CustomError({
      name: ERROR_STATUS.UNPROCESSABLE_ENTITY.name,
      statusCode: ERROR_STATUS.UNPROCESSABLE_ENTITY.statusCode,
      message: 'Address or coordinates required',
    });

    errorMiddleware(error, req, res, nextFunction);

    expect(res.status).to.have.been.calledWith(422);
    expect(res.json).to.have.been.calledWith({ message: 'Address or coordinates required' });
  });

  it('Testing with UNEXPECTED_ERROR', async function () {
    const error = new CustomError({
      name: 'UNEXPECTED_ERROR',
      message: 'Erro inesperado',
    });

    errorMiddleware(error, req, res, nextFunction);

    expect(res.status).to.have.been.calledWith(500);
    expect(res.json).to.have.been.calledWith({ message: 'Erro inesperado' });
  });
});
