import sinon from 'sinon';
import { NextFunction, Request, Response } from 'express';
import sinonChai from 'sinon-chai';
import chai, { expect } from 'chai';
import { BeAnObject, IObjectWithTypegooseFunction } from '@typegoose/typegoose/lib/types';
import { Document } from 'mongoose';
import { Region } from '../../../src/db/models';
import CustomError from '../../../src/errors/error';
import regionsMock from '../../mocks/regions.mock';
import regionsService from '../../../src/services/regions.service';
import regionsController from '../../../src/controllers/regions.controller';
import { ERROR_STATUS } from '../../../src/constants/STATUS_CODE';

chai.use(sinonChai);

type RegionTestType = {
  message: string;
  data: Document<unknown, BeAnObject, Region> &
    Omit<Region & Required<{ _id: string }>, 'typegooseName'> &
    IObjectWithTypegooseFunction;
};

type RegionsTestType = {
  message: string;
  data: (Document<unknown, BeAnObject, Region> &
    Omit<Region & Required<{ _id: string }>, 'typegooseName'> &
    IObjectWithTypegooseFunction)[];
  page: number;
  limit: number;
  total: number;
};

describe('Testing region controller', function () {
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

      sinon.stub(regionsService, 'getAll').resolves(regionsMock.regions as RegionsTestType);

      await regionsController.getAll(req, res, nextFunction);

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith(regionsMock.regions as RegionsTestType);
    });

    it('Testing when there is no region registered', async function () {
      req.query = {
        page: '1',
        limit: '10',
      };

      sinon.stub(regionsService, 'getAll').rejects(
        new CustomError({
          name: ERROR_STATUS.NOT_FOUND.name,
          statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
          message: 'There is no region registered in this range',
        }),
      );

      await regionsController.getAll(req, res, nextFunction);

      expect(nextFunction).to.have.been.calledWith(sinon.match.instanceOf(CustomError));
      expect(nextFunction).to.have.been.calledWith(sinon.match.has('statusCode', 404));
      expect(nextFunction).to.have.been.calledWith(
        sinon.match.has('message', 'There is no region registered in this range'),
      );
    });
  });

  describe('Testing getById', function () {
    it('Testing when returns statusCode 200', async function () {
      req.params = {
        id: '60d4b8b2b4c1fd1f1c7a1b5a',
      };

      sinon
        .stub(regionsService, 'getById')
        .resolves({ message: 'Successfully obtained regions', data: regionsMock.region } as RegionTestType);

      await regionsController.getById(req, res, nextFunction);

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({
        message: 'Successfully obtained regions',
        data: regionsMock.region,
      } as RegionTestType);
    });

    it('Testing when region is not found', async function () {
      req.params = {
        id: '60d4b8b2b4c1fd1f1c7a1b5a',
      };

      sinon.stub(regionsService, 'getById').rejects(
        new CustomError({
          name: ERROR_STATUS.NOT_FOUND.name,
          statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
          message: `No region was found with id ${req.params.id}`,
        }),
      );

      await regionsController.getById(req, res, nextFunction);

      expect(nextFunction).to.have.been.calledWith(sinon.match.instanceOf(CustomError));
      expect(nextFunction).to.have.been.calledWith(sinon.match.has('statusCode', 404));
      expect(nextFunction).to.have.been.calledWith(
        sinon.match.has('message', `No region was found with id ${req.params.id}`),
      );
    });

    describe('Testing getSpecificPoint', function () {
      it('Testing when returns statusCode 200', async function () {
        req.params = {
          lng: '10',
          lat: '10',
        };

        sinon.stub(regionsService, 'getSpecificPoint').resolves({
          message: 'Successfully obtained regions',
          data: [regionsMock.regionPopulatedUser],
        } as any);

        await regionsController.getSpecificPoint(req, res, nextFunction);

        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
          message: 'Successfully obtained regions',
          data: [regionsMock.regionPopulatedUser],
        });
      });

      it('Testing when throws error 500', async function () {
        req.params = {
          lng: '10000',
          lat: '10000',
        };

        sinon.stub(regionsService, 'getSpecificPoint').rejects(
          new CustomError({
            name: 'INTERNAL_SERVER_ERROR',
            statusCode: 500,
            message:
              'invalid point in geo near query $geometry argument: { type: "Point", coordinates: [ 1000, 1000 ] }  Longitude/latitude is out of bounds, lng: 1000 lat: 1000',
          }),
        );

        await regionsController.getSpecificPoint(req, res, nextFunction);

        expect(nextFunction).to.have.been.calledWith(sinon.match.instanceOf(CustomError));
        expect(nextFunction).to.have.been.calledWith(sinon.match.has('statusCode', 500));
      });

      it('Testing when there is no region registered', async function () {
        req.params = {
          lng: '10',
          lat: '10',
        };

        sinon.stub(regionsService, 'getSpecificPoint').resolves({
          message: 'Successfully obtained regions',
          data: [],
        } as any);

        await regionsController.getSpecificPoint(req, res, nextFunction);

        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
          message: 'Successfully obtained regions',
          data: [],
        });
      });
    });

    describe('Testing getByDistance', function () {
      it('Testing when returns statusCode 200', async function () {
        req.query = {
          lng: '10',
          lat: '10',
          distance: '1000',
        };

        sinon.stub(regionsService, 'getByDistance').resolves({
          message: 'Successfully obtained regions',
          data: [regionsMock.regionPopulatedUser],
        } as any);

        await regionsController.getByDistance(req, res, nextFunction);

        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
          message: 'Successfully obtained regions',
          data: [regionsMock.regionPopulatedUser],
        });
      });

      it('Testing when there is no region registered in the area', async function () {
        req.query = {
          lng: '10',
          lat: '10',
          distance: '10000',
        };

        sinon.stub(regionsService, 'getByDistance').rejects(
          new CustomError({
            name: ERROR_STATUS.NOT_FOUND.name,
            statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
            message: 'No regions were found within this radius',
          }),
        );

        await regionsController.getByDistance(req, res, nextFunction);

        expect(nextFunction).to.have.been.calledWith(sinon.match.instanceOf(CustomError));
        expect(nextFunction).to.have.been.calledWith(sinon.match.has('statusCode', 404));
        expect(nextFunction).to.have.been.calledWith(
          sinon.match.has('message', 'No regions were found within this radius'),
        );
      });

      it('Testing when filtering a region by user', async function () {
        req.query = {
          lng: '10',
          lat: '10',
          distance: '10000',
          user: '60d4b8b2b4c1fd1f1c7a1b5a',
        };

        sinon.stub(regionsService, 'getByDistance').resolves({
          message: 'Successfully obtained regions',
          data: [regionsMock.regionPopulatedUser],
        } as any);

        await regionsController.getByDistance(req, res, nextFunction);

        expect(res.status).to.have.been.calledWith(200);
        expect(res.json).to.have.been.calledWith({
          message: 'Successfully obtained regions',
          data: [regionsMock.regionPopulatedUser],
        });
      });

      it('Testing when filtering a region by invalid user', async function () {
        req.query = {
          lng: '10',
          lat: '10',
          distance: '10000',
          user: '60d4b8b2b4c1fd1f1c7a1b5a',
        };

        sinon.stub(regionsService, 'getByDistance').rejects(
          new CustomError({
            name: ERROR_STATUS.NOT_FOUND.name,
            statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
            message: 'No region belongs to this user',
          }),
        );

        await regionsController.getByDistance(req, res, nextFunction);

        expect(nextFunction).to.have.been.calledWith(sinon.match.instanceOf(CustomError));
        expect(nextFunction).to.have.been.calledWith(sinon.match.has('statusCode', 404));
        expect(nextFunction).to.have.been.calledWith(
          sinon.match.has('message', 'No region belongs to this user'),
        );
      });
    });

    describe('Testing create', function () {
      it('Testing when returns statusCode 201', async function () {
        req.body = {
          name: 'Teste',
          coordinates: [10, 10],
          user: '60d4b8b2b4c1fd1f1c7a1b5a',
        };

        sinon.stub(regionsService, 'create').resolves({
          message: 'Region created successfully',
          data: regionsMock.region,
        } as RegionTestType);

        await regionsController.create(req, res, nextFunction);

        expect(res.status).to.have.been.calledWith(201);
      });

      it('Testing when user is not found', async function () {
        req.body = {
          name: 'Teste',
          coordinates: [10, 10],
          user: '60d4b8b2b4c1fd1f1c7',
        };

        sinon.stub(regionsService, 'create').rejects(
          new CustomError({
            name: ERROR_STATUS.NOT_FOUND.name,
            statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
            message: 'No users were found with the id',
          }),
        );

        await regionsController.create(req, res, nextFunction);

        expect(nextFunction).to.have.been.calledWith(sinon.match.instanceOf(CustomError));
        expect(nextFunction).to.have.been.calledWith(sinon.match.has('statusCode', 404));
        expect(nextFunction).to.have.been.calledWith(
          sinon.match.has('message', 'No users were found with the id'),
        );
      });

      it('Testing when region is already registered', async function () {
        req.body = {
          name: 'Teste',
          coordinates: [10, 10],
          user: '60d4b8b2b4c1fd1f1c7a1b5a',
        };

        sinon.stub(regionsService, 'create').rejects(
          new CustomError({
            name: ERROR_STATUS.UNPROCESSABLE_ENTITY.name,
            statusCode: ERROR_STATUS.UNPROCESSABLE_ENTITY.statusCode,
            message: 'This region is already registered',
          }),
        );

        await regionsController.create(req, res, nextFunction);

        expect(nextFunction).to.have.been.calledWith(sinon.match.instanceOf(CustomError));
        expect(nextFunction).to.have.been.calledWith(sinon.match.has('statusCode', 422));
        expect(nextFunction).to.have.been.calledWith(sinon.match.has('message', 'This region is already registered'));
      });
    });

    describe('Testing update', function () {
      it('Testing when returns statusCode 201', async function () {
        req.body = {
          name: 'Teste',
          coordinates: [10, 10],
          user: '60d4b8b2b4c1fd1f1c7a1b5a',
        };

        req.params = {
          id: '60d4b8b2b4c1fd1f1c7a1b5a',
        };

        sinon.stub(regionsService, 'update').resolves({
          message: 'Region updated successfully',
          data: regionsMock.region,
        } as RegionTestType);

        await regionsController.update(req, res, nextFunction);

        expect(res.status).to.have.been.calledWith(201);
        expect(res.json).to.have.been.calledWith({
          message: 'Region updated successfully',
          data: regionsMock.region,
        } as RegionTestType);
      });

      it('Testing when region is not found', async function () {
        req.body = {
          name: 'Teste',
          coordinates: [10, 10],
          user: '60d4b8b2b4c1fd1f1c7a1b5a',
        };

        req.params = {
          id: '60d4b8b2b4c1fd1f1c7a',
        };

        sinon.stub(regionsService, 'update').rejects(
          new CustomError({
            name: ERROR_STATUS.NOT_FOUND.name,
            statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
            message: `No region was found with id ${req.params.id}`,
          }),
        );

        await regionsController.update(req, res, nextFunction);

        expect(nextFunction).to.have.been.calledWith(sinon.match.instanceOf(CustomError));
        expect(nextFunction).to.have.been.calledWith(sinon.match.has('statusCode', 404));
        expect(nextFunction).to.have.been.calledWith(
          sinon.match.has('message', `No region was found with id ${req.params.id}`),
        );
      });

      it('Testing when user is not found', async function () {
        req.body = {
          name: 'Teste',
          coordinates: [10, 10],
          user: '010201',
        };

        req.params = {
          id: '60d4b8b2b4c1fd1f1c7a1b5a',
        };

        sinon.stub(regionsService, 'update').rejects(
          new CustomError({
            name: ERROR_STATUS.NOT_FOUND.name,
            statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
            message: 'No users were found with the id',
          }),
        );

        await regionsController.update(req, res, nextFunction);

        expect(nextFunction).to.have.been.calledWith(sinon.match.instanceOf(CustomError));
        expect(nextFunction).to.have.been.calledWith(sinon.match.has('statusCode', 404));
        expect(nextFunction).to.have.been.calledWith(
          sinon.match.has('message', 'No users were found with the id'),
        );
      });
    });

    describe('Testing deleteRegion', function () {
      it('Testing when returns statusCode 204', async function () {
        req.params = {
          id: '60d4b8b2b4c1fd1f1c7a1b5a',
        };

        sinon.stub(regionsService, 'deleteRegion').resolves();

        await regionsController.deleteRegion(req, res, nextFunction);

        expect(res.status).to.have.been.calledWith(204);
      });

      it('Testing when a region is not found', async function () {
        req.params = {
          id: '6c7a1b5a',
        };

        sinon.stub(regionsService, 'deleteRegion').rejects(
          new CustomError({
            name: ERROR_STATUS.NOT_FOUND.name,
            statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
            message: `No region was found with id ${req.params.id}`,
          }),
        );

        await regionsController.deleteRegion(req, res, nextFunction);

        expect(nextFunction).to.have.been.calledWith(sinon.match.instanceOf(CustomError));
        expect(nextFunction).to.have.been.calledWith(sinon.match.has('statusCode', 404));
        expect(nextFunction).to.have.been.calledWith(
          sinon.match.has('message', `No region was found with id ${req.params.id}`),
        );
      });
    });
  });
});
