const db = require('../db');
const bcrypt = require('bcryptjs');
const redis = require('../redis');

const getUserName = async userId => {
  const client = await db
  .connect()
  .catch(err => {
    console.log('Unable to connect', err.stack);
    return res.json({error: 'Something went wrong.'});
  });

  try {
    let text = `SELECT fullname FROM users WHERE users.id = $1`;
    const resp = await client.query(text, [userId]);

    if (resp.rowCount === 1) {
      return resp.rows[0].fullname;
    }
    return '';
  } catch (err) {
    console.log('Error while retrieving data', err);
    return '';
  } finally {
    client.release();
  }
}

const getProfile = async (req, res) => {
  const userId = req.params.id;

  const error = () => {
    return res.json({error: 'No results'});
  }

  const client = await db
  .connect()
  .catch(err => {
    console.log('Unable to connect', err.stack);
    return res.json({error: 'Something went wrong.'});
  });

  try {
    let text = `SELECT fullname, email, joined FROM users WHERE users.id = $1`;
    const resp = await client.query(text, [userId]);

    if (resp.rowCount === 1) {
      return res.json(resp.rows[0]);
    }
    return error();
  } catch (err) {
    return res.json({error: err});
  } finally {
    client.release();
  }
}

const updateProfile = async (req, res) => {
  const userid = req.params.id;
  const { name } = req.body;

  const error = () => {
    return res.json({result: 'Unable to update information.'});
  }

  const client = await db
  .connect()
  .catch(err => {
    console.log('Unable to connect', err.stack);
    return error();
  });

  try {
    let text = 'UPDATE users SET fullname = $2 WHERE id = $1';
    await client.query(text, [userid, name]);

    return res.json({result: 'OK', name: name});
  } catch (err) {
    console.error('Error in transaction', err.stack);
    return error();
  } finally {
    client.release();
  }
}

const updatePassword = async (req, res) => {
  const userid = req.params.id;
  const { currpwd, newpwd, repeatpwd } = req.body;
  const { authorization } = req.headers;

  const error = () => {
    return res.json({result: 'Unable to update information.'});
  }

  if (newpwd !== repeatpwd) {
    return res.json({result: 'New password and Repeat password are different.'});
  }
  
  const client = await db
  .connect()
  .catch(err => {
    console.log('Unable to connect', err.stack);
    return error();
  });

  try {
    let text = `SELECT hash, L.id 
      FROM users U INNER JOIN login L ON U.email=L.email 
      WHERE U.id = $1`;
    const resp = await client.query(text, [userid]);

    if (resp.rowCount === 1) {
      const { hash, id } = resp.rows[0];
      if (!bcrypt.compareSync(currpwd, hash)) {
        return res.json({result: 'Wrong password.'});
      }

      const salt = bcrypt.genSaltSync(10);
      let newhash = bcrypt.hashSync(newpwd, salt);
      text = `UPDATE login SET hash=$2 WHERE id=$1`;
      await client.query(text, [id, newhash]);
      redis.remove(authorization);

      return res.json({result: 'OK'});
    }
  } catch (err) {
    console.error('Error in transaction', err.stack);
    return error();
  } finally {
    client.release();
  }

}

module.exports = {
  getProfile,
  getUserName,
  updateProfile,
  updatePassword
};