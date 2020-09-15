const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

const client = new Client({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'briciole',
  password: 'postgres',
  port: 5432,
})
client.connect()

app.post('/register', (req, res) => {
  // TODO: add a transaction
  const { name, email, password} = req.body;

  let text = 'INSERT INTO users (fullname, email, joined) VALUES($1, $2, $3)';
  let values = [name, email, new Date()];

  client.query(text, values)
  .then(() => {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        text = 'INSERT INTO login (email, hash) VALUES($1, $2)';
        values = [email, hash];

        client.query(text, values)
        .then(() => {
          res.json({result: 'OK'});
        })
        .catch(() => {
          res.json({result: 'Unable to register.'});
        })
      });
    });
  })
  .catch(() => {
    res.json({result: 'Unable to register.'});
  })
});

app.post('/signin', (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  console.log(password);

  bcrypt.compare(password, lastPwd, (err, res) => {
    if (res) {
      console.log('Password matches');
    }
    else {
      console.log('Wrong password');
    }
  });

  if (false) {
    res.status(400).json({result: 'Wrong Credentials'});
  }

  res.json({result: 'OK', id: 123, name: 'Erika'});
});

app.post('/signout', (req, res) => {
  if (false) {
    res.status(400).json('Something went wrong');
  }

  res.json('OK');
});

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  console.log(id);

  if (false) {
    res.status(400).json('Something went wrong');
  }

  res.json('OK');
});

app.listen(3001, () => {
  console.log('Briciole API listening on port 3001');
});