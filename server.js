if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

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
  connectionString : process.env.DBCONN
});
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

app.post('/register', handleRegister(pool));
app.post('/signin', handleSignIn(pool));

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Briciole API listening on port ${PORT}`);
});