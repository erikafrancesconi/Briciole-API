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

module.exports = {
  set
}