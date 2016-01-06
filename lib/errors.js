/**
 * Wrap HTTP error responses from the consul API
 */
var RequestError = exports.RequestError = function(code, message) {
  if(!(this instanceof RequestError))
    return new RequestError(code, message);

  Error.call(this, message);
  this.code = code;
};

Object.setPrototypeOf(RequestError.prototype, Error.prototype);
RequestError.prototype.name = 'RequestError';

/**
 * Wrap response parsing errors
 */
var PayloadError = exports.PayloadError = function(payload, message) {
  if(!(this instanceof PayloadError))
    return new PayloadError(payload, message);

  Error.call(this, message);
  this.payload = payload;
};

Object.setPrototypeOf(PayloadError.prototype, Error.prototype);
PayloadError.prototype.name = 'PayloadError';
