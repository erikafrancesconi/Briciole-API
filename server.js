const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

let lastPwd = ''; // TODO: remove this shit

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

app.post('/register', (req, res) => {
  const { name, email, password} = req.body;
  console.log(name);
  console.log(email);
  console.log(password);

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
        // Store hash in your password DB.
        lastPwd = hash;
        console.log(lastPwd);
    });
  });

  if (false) {
    res.status(400).json('Something went wrong');
  }

  res.json('OK');
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