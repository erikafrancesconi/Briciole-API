const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { handleRegister } = require('./controllers/register');
const { handleSignIn } = require('./controllers/signin');

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'briciole',
  password: 'postgres',
  port: 5432,
});
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

app.post('/register', handleRegister(pool));

app.post('/signin', handleSignIn(pool));

app.listen(3001, () => {
  console.log('Briciole API listening on port 3001');
});