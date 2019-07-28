'use strict';

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

    scope.walk(Infinity, (child, level) => {
      let keep = filterFn(child, level);

      if (keep !== undefined) {
        results.push(keep);
      }

      return true;
    }, 0, childResolverFn);

    return results;
  }

  unwind(...args) {
    let scope = this;
    let childResolverFn = defaultChildResolver;
    let transformFn = args[1];
    let parentType = args[0];

    let newChildren = this.filterMap((child, level) => {
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
    }, childResolverFn);

    scope.children = newChildren;

    return scope.children;
  }

  walk(...args) {
    args = normaliseArguments(...args);

    let scope = this;
    let depth = args[0];
    let callback = args[1];
    let level = args[2];
    let childResolverFn = args[3];
    let shouldContinue = true;

    function chainCallback(child) {
      shouldContinue = callback(child, level);

      if (!shouldContinue) return false;

      let descendants = childResolverFn.apply(child, [level]);

      if (child && typeof child == 'object' && descendants.length > 0) {
        child.walk(depth, callback, level + 1);
      }

      return true;
    }

    function walkInner() {
      let children = childResolverFn.apply(scope, [level]);

      if (children.length > 0 && level < depth) {
        children.every(chainCallback);
      }

      return;
    }

    function walkOuter() {
      if (level == 0) {
        shouldContinue = callback(scope, level);

        if (!shouldContinue) return;

        level++;

        return walkInner();
      } else {
        return walkInner();
      }
    }

    return walkOuter();
  }
}

module.exports = {Tree: Tree};
