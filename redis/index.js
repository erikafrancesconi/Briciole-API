const redis = require("redis");
const { promisify } = require("util");

let client = redis.createClient(process.env.REDISCONN);
client.on("error", error => {
  console.log('Error connecting to client', error);
});

const setAsync = promisify(client.set).bind(client);
const set = (key, value) => {
  return setAsync(key, value);
}

const getAsync = promisify(client.get).bind(client);
const get = key => {
  return getAsync(key);
}

const expire = (key, time) => {
  client.expire(key, time);
}

const remove = key => {
  client.del(key);
}

module.exports = {
  set,
  get,
  remove,
  expire,
  client
}