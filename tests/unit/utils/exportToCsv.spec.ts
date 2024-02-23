import sinon, { SinonStub } from 'sinon';
import fs from 'fs/promises';
import json2csv from 'json2csv';
import exportToCsv from '../../../src/utils/exportToCsv';
import sinonChai from 'sinon-chai';
import chai, { expect } from 'chai';
import CustomError from '../../../src/errors/error';
import chaiAsPromised from 'chai-as-promised';

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('exportToCsv', () => {
  let parseAsyncStub: SinonStub;
  let writeFileStub: SinonStub;

  beforeEach(() => {
    parseAsyncStub = sinon.stub(json2csv, 'parseAsync');
    writeFileStub = sinon.stub(fs, 'writeFile');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should export data to CSV file', async () => {
    const fields = ['_id', 'name', 'email'];
    const data = [{ _id: 1, name: 'John', email: 'john@example.com' }];
    const route = 'users';

    const expectedCsv = '"_id","name","email""1","John","john@example.com"';

    parseAsyncStub.resolves(expectedCsv);

    await exportToCsv(data, route, fields);

    expect(parseAsyncStub).to.have.been.calledWith();
    expect(parseAsyncStub).to.have.been.calledWithExactly(data, { fields });
    expect(writeFileStub).to.have.been.calledWith();
  });

  it('Should handle error 500', async () => {
    const data = [{ _id: 1, name: 'John', email: 'john@example.com' }];
    const route = 'users';
    const fields = ['_id', 'name', 'email', 'address', 'coordinates', 'createdAt', 'updatedAt'];

    const expectedError = new CustomError({
      name: 'ExportError',
      message: 'Unexpected error when mounting file',
      statusCode: 500,
    });

    parseAsyncStub.rejects(expectedError);

    await expect(exportToCsv(data, route, fields)).to.be.rejectedWith(
      CustomError,
      'Unexpected error when mounting file',
    );
  });
});
