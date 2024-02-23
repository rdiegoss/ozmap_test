import axios from 'axios';
import CustomError from '../errors/error';
import { ERROR_STATUS } from '../constants/STATUS_CODE';

const API_KEY = process.env.GOOGLE_API_KEY;
const GEOCODING_REVERSE_URL = process.env.GOOGLE_GEOCODING_REVERSE_URL;
const GEOCODING_URL = process.env.GOOGLE_GEOCODING_URL;

class GeoLib {
  public async getAddressFromCoordinates(coordinates: { lat: number; lng: number }): Promise<string> {
    const response = await axios.get(`${GEOCODING_REVERSE_URL}${coordinates.lat},${coordinates.lng}&key=${API_KEY}`);

    if (response.statusText !== 'OK') {
      throw new CustomError({
        name: ERROR_STATUS.BAD_REQUEST.name,
        statusCode: ERROR_STATUS.BAD_REQUEST.statusCode,
        message: 'Invalid Geocoding API response',
      });
    }

    if (!response.data.results.length) {
      throw new CustomError({
        name: ERROR_STATUS.NOT_FOUND.name,
        statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
        message: 'No address was found with the given coordinates',
      });
    }

    return response.data.results[0].formatted_address;
  }

  public async getCoordinatesFromAddress(zipcode: string): Promise<{ lat: number; lng: number }> {
    const response = await axios.get(`${GEOCODING_URL}${zipcode}&key=${API_KEY}`);

    if (response.statusText !== 'OK') {
      throw new CustomError({
        name: ERROR_STATUS.BAD_REQUEST.name,
        statusCode: ERROR_STATUS.BAD_REQUEST.statusCode,
        message: 'Invalid Geocoding API response',
      });
    }

    if (!response.data.results.length) {
      throw new CustomError({
        name: ERROR_STATUS.NOT_FOUND.name,
        statusCode: ERROR_STATUS.NOT_FOUND.statusCode,
        message: 'No coordinates were found with the zip code provided',
      });
    }

    return response.data.results[0].geometry.location;
  }
}

export default new GeoLib();
