import sinon from 'sinon';
import { NextFunction, Request, Response } from 'express';
import sinonChai from 'sinon-chai';
import chai, { expect } from 'chai';
import { RegionModel, UserModel } from '../../../src/db/models';
import CustomError from '../../../src/errors/error';
import regionsMock from '../../mocks/regions.mock';
import exportService from '../../../src/services/export.service';
import exportController from '../../../src/controllers/export.controller';
import usersMock from '../../mocks/users.mock';

chai.use(sinonChai);

describe('Testing export controller', function () {
  const req = {} as Request;
  const res = {} as Response;
  let nextFunction: NextFunction;

  beforeEach(function () {
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);

    nextFunction = sinon.spy() as NextFunction;

    sinon.restore();
  });

  describe('Testing exportUsers', function () {
    it('Testing with users registered', async function () {
      sinon.stub(RegionModel, 'find').resolves([usersMock.user]);
      sinon.spy(exportService, 'exportUsers');

      await exportController.exportUsers(req, res, nextFunction);

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({
        message: 'Successfully exported users',
      });
    });

    it('Testing without users registered', async function () {
      sinon.stub(UserModel, 'find').resolves([]);
      sinon.spy(exportService, 'exportUsers');

      await exportController.exportUsers(req, res, nextFunction);

      expect(nextFunction).to.have.been.calledWith(
        sinon.match
          .instanceOf(CustomError)
          .and(sinon.match.has('message', 'Unable to export as there are no registered users')),
      );
    });
  });

  describe('Testing exportRegions', function () {
    it('Testing with regions registered', async function () {
      sinon.stub(RegionModel, 'find').resolves([regionsMock.region]);
      sinon.spy(exportService, 'exportRegions');

      await exportController.exportRegions(req, res, nextFunction);

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({
        message: 'Successfully exported regions',
      });
    });

    it('Testing without regions registered', async function () {
      sinon.stub(RegionModel, 'find').resolves([]);
      sinon.spy(exportService, 'exportRegions');

      await exportController.exportRegions(req, res, nextFunction);

      expect(nextFunction).to.have.been.calledWith(
        sinon.match
          .instanceOf(CustomError)
          .and(sinon.match.has('message', 'Unable to export as there are no regions registered')),
      );
    });
  });
});
