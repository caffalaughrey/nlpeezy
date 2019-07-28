'use strict';

const UNSUPPORTED_ERR_ATTR = 'FATAL: Unsupported type for `err`!';
const UNSUPPORTED_TYPE_ATTR = 'FATAL: Unsupported type for `type`!';

class FatalError extends Error {}

class TypedError extends Error {
  constructor(message) {
    super(message);

    this.name = 'TypedError';
    this.errors = [];
  }

  getErrors() {
    if (this.errors.length == 0) {
      let copy = this.shallowCopy();

      this.errors.push(copy);
    }

    return this.errors;
  }

  addError(err) {
    let errors = this.getErrors();

    this.errors = this.errors.concat(err.getErrors());
  }

  shallowCopy() {
    let type = this.constructor;
    let copy = new type();

    copy.message = this.message;
    copy.stack = this.stack;

    return copy;
  }
}

function copyUntyped(err) {
  this.message = err.message;
  this.stack = err.stack;
}

module.exports = {
  getTypedError: function(err, type) {
    if (err === null || err === undefined) {
      return err;
    }

    type = type || TypedError;

    // Type can either be null or of instance TypedError when passed as an
    // argument. If it was neither, throw a FatalError.
    if (!(new type() instanceof TypedError)) {
      throw new FatalError(
        `${UNSUPPORTED_TYPE_ATTR} Received: ${type.toString()}`);
    }

    let typedErr;

    switch (true) {
      // If it's already a TypedError, do nothing and assign
      case err instanceof TypedError:
        typedErr = err;

        break;
      // If it's a more generic Error, create a new error from the given `type`
      // and copy the old error's values
      case err instanceof Error:
        typedErr = new type();

        copyUntyped.apply(typedErr, [err]);

        break;
      // If it's a string, treat it like a message and pass that into a newly
      // constructed error from the given `type`.
      case typeof err == 'string':
        typedErr = new type(err);

        break;
      // Don't know what to do, throw a FatalError.
      default:
        let message =
          `${UNSUPPORTED_ERR_ATTR} Received: ${err.constructor.toString()}`;

        throw new FatalError(message);
    }

    return typedErr;
  },
  FatalError: FatalError,
  TypedError: TypedError,
  UNSUPPORTED_ERR_ATTR: UNSUPPORTED_ERR_ATTR,
  UNSUPPORTED_TYPE_ATTR: UNSUPPORTED_TYPE_ATTR
}
