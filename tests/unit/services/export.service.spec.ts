import sinon from 'sinon';
import exportToCsv from '../../../src/utils/exportToCsv';
import sinonChai from 'sinon-chai';
import chai, { expect } from 'chai';
import CustomError from '../../../src/errors/error';
import chaiAsPromised from 'chai-as-promised';
import usersMock from '../../mocks/users.mock';
import exportService from '../../../src/services/export.service';
import { RegionModel, UserModel } from '../../../src/db/models';
import regionsMock from '../../mocks/regions.mock';

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Testing export service', function () {
  beforeEach(function () {
    sinon.restore();
  });

  describe('Testing exportUsers', function () {
    it('Testing with users registered', async function () {
      sinon.stub(UserModel, 'find').resolves([usersMock.user]);
      sinon.spy(exportToCsv);

      const exportSerivce = await exportService.exportUsers();

      expect(exportSerivce).to.be.an('object');
      expect(exportSerivce).to.have.property('message');
      expect(exportSerivce.message).to.be.equal('Successfully exported users');
    });

    it('Testing without users registered', async function () {
      sinon.stub(UserModel, 'find').resolves([]);
      sinon.spy(exportToCsv);

      await expect(exportService.exportUsers()).to.be.rejectedWith(
        CustomError,
        'Unable to export as there are no registered users',
      );
    });
  });

  describe('Testing exportRegions', function () {
    it('Testing with regions registered', async function () {
      sinon.stub(RegionModel, 'find').resolves([regionsMock.region]);
      sinon.spy(exportToCsv);

      const exportSerivce = await exportService.exportRegions();

      expect(exportSerivce).to.be.an('object');
      expect(exportSerivce).to.have.property('message');
      expect(exportSerivce.message).to.be.equal('Successfully exported regions');
    });

    it('Testing without regions registered', async function () {
      sinon.stub(RegionModel, 'find').resolves([]);
      sinon.spy(exportToCsv);

      await expect(exportService.exportRegions()).to.be.rejectedWith(
        CustomError,
        'Unable to export as there are no regions registered',
      );
    });
  });
});
