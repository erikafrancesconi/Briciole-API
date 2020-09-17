const bcrypt = require('bcryptjs');
const db = require('../db');

const handleSignIn = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({result: 'Wrong Credentials.'});
  }
  
  let text = 'SELECT U.id, fullname, hash FROM users U INNER JOIN login L ON U.email=L.email WHERE U.email = $1';
  db.query(text, [email])
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
  });
};

module.exports = {
  handleSignIn: handleSignIn
};