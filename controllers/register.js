const bcrypt = require('bcryptjs');

const handleRegister = (pool) => (req, res) => {
  const { name, email, password} = req.body;

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
}

module.exports = {
  handleRegister: handleRegister
}