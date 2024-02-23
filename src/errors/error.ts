export interface CustomErrorInterface extends Error {
  statusCode?: number;
}
class CustomError extends Error {
  statusCode?: number;

  constructor({ statusCode, message }: CustomErrorInterface) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default CustomError;
