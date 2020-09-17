const bcrypt = require('bcryptjs');
const db = require('../db');

const handleSignIn = (req, res) => {
  const error = () => {
    return res.json({result: 'Wrong Credentials.'});
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return error();
  }
  
  let text = 'SELECT U.id, fullname, hash FROM users U INNER JOIN login L ON U.email=L.email WHERE U.email = $1';
  db.query(text, [email])
  .then(resp => {
    if (resp.rowCount === 1) {
      // Lo username esiste
      const { hash, id, fullname } = resp.rows[0];
      bcrypt.compare(password, hash, (err, resq) => {
        if (resq) {
          // La password coincide
          return res.json({result: 'OK', id: id, name: fullname});
        }
        // La password non coincide
        return error();
      });
    }
    else {
      // Lo username non esiste
      return error();
    }
  })
  .catch(() => {
    return error();
  });
};

module.exports = {
  handleSignIn: handleSignIn
};