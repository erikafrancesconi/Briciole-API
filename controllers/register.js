const bcrypt = require('bcryptjs');
const db = require('../db');

const emailIsValid = email => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const handleRegister = async function(req, res) {
  const { name, email, password} = req.body;

  if (!name || !email || !password) {
    return res.json({result: 'Please fill all fields.'});
  }

  if (!emailIsValid(email)) {
    return res.json({result: 'Invalid Email.'});
  }

  const client = await db
  .connect()
  .catch(err => {
    console.log('Unable to connect', err.stack);
    return res.json({result: 'Unable to register.'});
  });

  try {
    await client.query("BEGIN");

    let text = 'INSERT INTO users (fullname, email, joined) VALUES($1, $2, $3)';
    await client.query(text, [name, email, new Date()]);

    const salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(password, salt);

    text = 'INSERT INTO login (email, hash) VALUES($1, $2)';
    await client.query(text, [email, hash]);

    await client.query("COMMIT");

    return res.json({result: 'OK'});
  } catch (err) {
    await client.query("ROLLBACK");
    console.error('Error in transaction', err.stack);
    return res.json({result: 'Unable to register.'});
  } finally {
    client.release();
  }
}

module.exports = {
  handleRegister: handleRegister
}