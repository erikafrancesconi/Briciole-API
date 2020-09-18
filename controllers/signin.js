const bcrypt = require('bcryptjs');
const db = require('../db');

const handleSignIn = async function(req, res) {
  const error = () => {
    return res.json({result: 'Wrong Credentials.'});
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return error();
  }

  const client = await db
  .connect()
  .catch(err => {
    console.log('Unable to connect', err.stack);
    return res.json({result: 'Unable to register.'});
  });

  try {
    let text = 'SELECT U.id, fullname, hash FROM users U INNER JOIN login L ON U.email=L.email WHERE U.email = $1';
    const resp = await client.query(text, [email]);

    if (resp.rowCount === 1) {
      // Lo username esiste
      const { hash, id, fullname } = resp.rows[0];
      if (bcrypt.compareSync(password, hash)) {
        // La password coincide, aggiorno l'ultimo login
        text = "UPDATE login SET lastlogin = $1 WHERE email = $2"
        await client.query(text, [new Date(), email]);

        return res.json({result: 'OK', id: id, name: fullname});
      }
      // La password non coincide
      return error();
    }
  } catch (err) {
    console.log('Error checking user', err.stack);
    return error();
  } finally {
    client.release();
  }
};

module.exports = {
  handleSignIn: handleSignIn
};