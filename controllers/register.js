const bcrypt = require('bcryptjs');
const db = require('../db');

const emailIsValid = email => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const handleRegister = (req, res) => {
  const { name, email, password} = req.body;

  if (!name || !email || !password) {
    return res.json({result: 'Please fill all fields.'});
  }

  if (!emailIsValid(email)) {
    return res.json({result: 'Invalid Email.'});
  }

  db.connect()
  .then(client => {
    const abort = err => {
      console.error('Error in transaction', err.stack);
      client.query('ROLLBACK', err => {
        if (err) {
          console.error('Error rolling back client', err.stack);
        }
      });
    }

    client.query('BEGIN')
    .then(() => {
      let text = 'INSERT INTO users (fullname, email, joined) VALUES($1, $2, $3)';
      let values = [name, email, new Date()];
      client.query(text, [name, email, new Date()])
      .then(() => {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            text = 'INSERT INTO login (email, hash) VALUES($1, $2)';
            values = [email, hash];
    
            client.query(text, values)
            .then(() => {
              client.query('COMMIT')
              .then(() => {
                return res.json({result: 'OK'});
              })
              .catch(err => {
                console.error('Error committing transaction', err.stack);
                return res.json({result: 'Unable to register.'});
              });
            })
            .catch(err => {
              abort(err)
              return res.json({result: 'Unable to register.'});
            })
          });
        });
      })
      .catch((err) => {
        abort(err);
        return res.json({result: 'Unable to register.'});
      })
    })
    .finally(() => {
      client.release();
    })
  })
  .catch(err => {
    console.log('Unable to connect', err.stack);
    return res.json({result: 'Unable to register.'});
  })
}

module.exports = {
  handleRegister: handleRegister
}