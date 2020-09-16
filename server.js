const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { Pool, Client } = require('pg');

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
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

app.post('/register', (req, res) => {
  // TODO: add a transaction
  const { name, email, password} = req.body;

  let text = 'INSERT INTO users (fullname, email, joined) VALUES($1, $2, $3)';
  let values = [name, email, new Date()];

  pool.connect()
  .then(client => {
    const abort = err => {
      if (err) {
        console.error('Error in transaction', err.stack);
        client.query('ROLLBACK', err => {
          if (err) {
            console.error('Error rolling back client', err.stack);
          }
        })
      }
    }

    client.query('BEGIN')
    .then(() => {
      client.query(text, values)
      .then(() => {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            text = 'INSERT INTO login (email, hash) VALUES($1, $2)';
            values = [email, hash];
    
            client.query(text, values)
            .then(() => {
              client.query('COMMIT')
              .then(() => {
                res.json({result: 'OK'});
              })
              .catch(err => {
                console.error('Error committing transaction', err.stack);
                res.json({result: 'Unable to register.'});
              });
            })
            .catch(err => {
              abort(err)
              res.json({result: 'Unable to register.'});
            })
          });
        });
      })
      .catch((err) => {
        abort(err);
        res.json({result: 'Unable to register.'});
      })
    })
  })
  .catch(err => {
    console.log('Unable to connect', err.stack);
    res.json({result: 'Unable to register.'});
  })
});

app.post('/signin', (req, res) => {
  const { email, password } = req.body;
  
  let text = 'SELECT U.id, fullname, hash FROM users U INNER JOIN login L ON U.email=L.email WHERE U.email = $1';
  pool.query(text, [email])
  .then(resp => {
    if (resp.rowCount === 1) {
      const { hash, id, fullname } = resp.rows[0];
      bcrypt.compare(password, hash, (err, resq) => {
        if (resq) {
          res.json({result: 'OK', id: id, name: fullname});
        }
        else {
          res.json({result: 'Wrong Credentials'});
        }
      });
    } else {
      res.json({result: 'Wrong Credentials'});
    }
  })
  .catch(() => {
    res.json({result: 'Wrong Credentials'});
  })
});

app.post('/signout', (req, res) => {
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