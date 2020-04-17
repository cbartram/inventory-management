const { REDIS_PASSWORD } = process.env;
const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const { REDIS_HOST } = require('./constants');

let cache;
try {
  const options = {
    host: process.env.REDIS_HOST || REDIS_HOST,
  };

  if(REDIS_PASSWORD) options.password = REDIS_PASSWORD;
  cache = redis.createClient(options);
} catch (e) {
  console.log('[ERROR] Failed to connect to redis client: ', e);
}

module.exports = cache;
