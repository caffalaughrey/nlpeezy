'use strict';

const redis = require('redis');
const settings = require('../settings');

let redisClient;

const strategies = {
  MEMORY: 'memory',
  REDIS: 'redis'
};

const defaultOptions = {
  separator: '$',
  strategy: strategies.MEMORY
};

const MUST_IMPLEMENT = 'FATAL: must implement';

class DataStore {
  constructor(config) {
    config = config || {};

    this.client = null;
    this.separator = config.separator || defaultOptions.separator;
    this.strategy = config.strategy || defaultOptions.strategy;
  }

  get(key, callback) {
    return this.client.get(key, callback);
  }

  quit(callback) {
    return this.client.quit(callback);
  }

  set(key, value, callback) {
    return this.client.set(key, value, callback);
  }

  initClient() {
    switch(this.strategy) {
      case strategies.MEMORY:
        this.client = new MemoryClient(this.getNamespace(), null, {});
        break;
      case strategies.REDIS:
        this.client = new RedisClient(this.getNamespace(), null);
    }
  }

  load(callback) {
    /* istanbul ignore next */
    throw MUST_IMPLEMENT;
  }

  getNamespace() {
    /* istanbul ignore next */
    throw MUST_IMPLEMENT;
  }
}

class DataStoreClient {
  constructor(namespace, separator) {
    this.namespace = namespace;
    this.separator = separator || defaultOptions.separator;
  }

  getNamespacedKey(key) {
    let namespace = this.namespace;
    let separator = this.separator;

    return `${namespace}${separator}${key}`;
  }

  get(key, callback) {
    /* istanbul ignore next */
    throw MUST_IMPLEMENT;
  }

  quit(callback) {
    /* istanbul ignore next */
    throw MUST_IMPLEMENT;
  }

  set(key, value, callback) {
    /* istanbul ignore next */
    throw MUST_IMPLEMENT;
  }
}

class MemoryClient extends DataStoreClient {
  constructor(namespace, separator, data) {
    super(namespace, separator);

    this.data = data || {};
  }

  get(key, callback) {
    let err, value;

    try {
      value = this.data[key];
    } catch(e) {
      err = e;
    } finally {
      return callback(err, value);
    }
  }

  quit(callback) {
    console.warn('quit is noop for MemoryClient');
    callback(null);
  }

  set(key, value, callback) {
    let err, success;

    try {
      this.data[key] = value;

      success = true;
    } catch(e) {
      err = e;
    } finally {
      return callback(err, success);
    }
  }
}

function loadRedisClient() {
  if (!redisClient) {
    redisClient = redis.createClient();

    if (settings.isTest) {
      redisClient.select(3);
    }
  }
}

class RedisClient extends DataStoreClient {
  get(key, callback) {
    loadRedisClient();

    let namespacedKey = this.getNamespacedKey(key);

    redisClient.get(namespacedKey, callback);
  }

  quit(callback) {
    loadRedisClient();

    redisClient.quit(err => {
      redisClient = null;

      callback(err);
    });
  }

  set(key, value, callback) {
    loadRedisClient();

    let namespacedKey = this.getNamespacedKey(key);

    redisClient.set(namespacedKey, value, callback);
  }
}

module.exports = {
  defaultOptions: defaultOptions,
  strategies: strategies,
  DataStore: DataStore
};
