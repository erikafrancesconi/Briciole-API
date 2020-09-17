const { Pool } = require('pg');

const pool = new Pool({
  connectionString : process.env.DBCONN
});
pool.on('connect', (client) => {
  console.log(client.processID, 'Pool connected.');
});
pool.on('acquire', (client) => {
  console.log(client.processID, 'Connection acquired from client.');
});
pool.on('remove', (client) => {
  console.log(client.processID, 'Client removed.');
})
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err, client).processID;
  process.exit(-1);
});

const connect = (err, client, release) => {
  return pool.connect(err, client, release);
};

const query = (text, params, callback) => {
  return pool.query(text, params, callback);
};

const end = () => {
  return pool.end();
}

module.exports = {
  connect: connect,
  query: query,
  end: end
};