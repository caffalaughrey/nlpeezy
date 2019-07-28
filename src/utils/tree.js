'use strict';

const chain = require('./chain');

const NON_ARRAY_VALUE = 'FATAL: Non-array value.'
const UNSUPPORTED_FILTER_TYPE = 'FATAL: Unsupported filter type.'

function defaultChildResolver() {
  return this.children;
}

function normaliseArguments(...args) {
  let depth = Infinity, callback, level = 0,
    childResolverFn = defaultChildResolver;

  if (args.length == 4) {
    childResolverFn = args[3];
  }

  if (args.length == 3 || args.length == 4) {
    level = args[2] || level;
  }

  if (args.length == 2 || args.length == 3 || args.length == 4) {
    depth = args[0];
    callback = args[1];
  } else if (args.length == 1) {
    callback = args[0];
  }

  return [depth, callback, level, childResolverFn];
}

class Tree {
  constructor() {
    this.children = [];
    this.parent = null;
  }

  filterMap(...args) {
    let scope = this;
    let childResolverFn = defaultChildResolver;
    let filterFn = args[0];
    let results = [];

    if (args.length == 2) {
      childResolverFn = args[1];
    }

    return scope.walk(Infinity, (child, level, next) => {
      let err;

      try {
        let keep = filterFn(child, level);

        if (keep !== undefined) {
          results.push(keep);
        }
      } catch (e) {
        err = e;
      } finally {
        return next(err);
      }
    }, 0, childResolverFn)
      .then(_ => new Promise((resolve, reject) => resolve(results)));
  }

  unwind(...args) {
    let scope = this;
    let childResolverFn = defaultChildResolver;
    let transformFn = args[1];
    let parentType = args[0];

    return this.filterMap((child, level) => {
      let parent = child.parent;
      let typeMatch = parentType ? parent instanceof parentType : true;

      if (level == 1 && !(child instanceof parentType)) {
        return child;
      } else if (level == 2 && typeMatch) {
        let oldParent = parent;
        child.parent = scope;

        transformFn(child, oldParent);

        return child;
      } else {
        return undefined;
      }
    }, childResolverFn).then(newChildren => {
      return new Promise((resolve, reject) => {
        scope.children = newChildren;

        resolve(scope.children);
      });
    });
  }

  walk(...args) {
    args = normaliseArguments(...args);

    let scope = this;
    let depth = args[0];
    let callback = args[1];
    let level = args[2];
    let childResolverFn = args[3];
    let shouldStop = false;
    let stopFn = () => shouldStop = true;

    function chainCallback(child, next) {
      callback(child, level, (err, stop) => {
        let descendants;

        if (err) {
          return next(err, null);
        }

        try {
          descendants = childResolverFn.apply(child, [level]);
        } catch(e) {
          err = e;
        }

        if (err) {
          return next(err, null);
        } else if (child && typeof child == 'object' && descendants.length > 0) {
          return child.walk(depth, callback, level + 1)
            .then(_ => next(null, stop));
        } else {
          return next(null, stop);
        }
      });
    }

    function walkInner() {
      let err;
      let children;

      try {
        children = childResolverFn.apply(scope, [level]);

        if (children && !(children instanceof Array)) {
          throw NON_ARRAY_VALUE;
        }
      } catch (e) {
        err = e;
      }

      if (err) {
        return new Promise((_, reject) => reject(err));
      } else if (children.length > 0 && level < depth) {
        return chain(children, chainCallback);
      } else {
        return;
      }
    }

    function walkOuter(resolve, reject) {
      if (level == 0) {
        callback(scope, level, (err, stop) => {
          if (err) {
            return reject(err);
          } else if (stop) {
            return resolve();
          } else {
            level++;

            return resolve(walkInner());
          }
        });
      } else {
        return resolve(walkInner());
      }
    }

    return new Promise(walkOuter);
  }
}

module.exports = {Tree: Tree};
