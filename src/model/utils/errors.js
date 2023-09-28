export class AppError extends Error {

  constructor(message, properties) {
    super(message);
    Object.assign(this, properties);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

}
