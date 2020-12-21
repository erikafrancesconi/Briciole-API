const bcrypt = require('bcryptjs');
const db = require('../db');
const redis = require('../redis');
const tokens = require('../utils/tokens');

const { getUserName } = require('./profile');

const handleSignIn = async function(req, res) {
  const error = () => {
    return res.json({result: 'Wrong Credentials.'});
  }

  const { authorization } = req.headers;
  if (authorization) {
    const id = await tokens.getIdFromToken(authorization);
    if (!id || id === 'ERROR') {
      return error();
    }

    const name = await getUserName(id);
    if (!name) {
      return error();
    }
    return res.json({ result: 'OK', id, name });
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
    let text = `SELECT U.id, fullname, hash 
      FROM users U INNER JOIN login L ON U.email=L.email 
      WHERE U.email = $1 and U.verified=TRUE`;
    const resp = await client.query(text, [email]);

    if (resp.rowCount === 1) {
      // Lo username esiste
      const { hash, id, fullname } = resp.rows[0];
      if (bcrypt.compareSync(password, hash)) {
        // La password coincide, aggiorno l'ultimo login
        text = "UPDATE login SET lastlogin = $1 WHERE email = $2"
        await client.query(text, [new Date(), email]);

        const token = await tokens.generateToken({ email, id });

        return res.json({ result: 'OK', id, name: fullname, token });
      }
      // La password non coincide
      return error();
    }
    // L'utente non esiste o non è verificato
    return error();
  } catch (err) {
    console.log('Error checking user', err.stack);
    return error();
  } finally {
    client.release();
  }
};

const handleSignOut = async function(req, res) {
  const { authorization } = req.headers;
  try {
    if (authorization) {
      redis.remove(authorization);
    }
  } catch (ignored) {}
  return res.json({ result: 'OK'});
}

module.exports = {
  handleSignIn,
  handleSignOut
};