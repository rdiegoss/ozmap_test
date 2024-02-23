import fs from 'fs/promises';
import json2csv from 'json2csv';
import path from 'path';
import CustomError from '../errors/error';

const exportToCsv = async <T>(data: T, route: string, fields: string[]) => {
  try {
    const csv = await json2csv.parseAsync(data, { fields });
    const filename = `${route.toUpperCase()}_${new Date().getTime()}.csv`;
    const pathname = path.resolve(__dirname, '..', 'exports', filename);

    await fs.writeFile(pathname, csv);
  } catch (error) {
    console.log('error', error)
    throw new CustomError({
      name: 'ExportError',
      message: 'Unexpected error when mounting file',
      statusCode: 500,
    });
  }
};

export default exportToCsv;
