const db = require('../db');
const bcrypt = require('bcryptjs');

const getProfile = async (req, res) => {
  const userId = req.params.id;

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
  } catch (err) {
    return res.json({error: err});
  } finally {
    client.release();
  }
}

const updateProfile = async (req, res) => {
  const { userid, name} = req.body;

  const client = await db
  .connect()
  .catch(err => {
    console.log('Unable to connect', err.stack);
    return res.json({result: 'Unable to update information.'});
  });

  try {
    let text = 'UPDATE users SET fullname = $2 WHERE id = $1';
    await client.query(text, [userid, name]);

    return res.json({result: 'OK', name: name});
  } catch (err) {
    console.error('Error in transaction', err.stack);
    return res.json({result: 'Unable to update information.'});
  } finally {
    client.release();
  }
}

const updatePassword = async (req, res) => {
  const { userid2: userid, currpwd, newpwd, repeatpwd} = req.body;

  if (newpwd !== repeatpwd) {
    return res.json({result: 'New password and Repeat password are different.'});
  }
  
  const client = await db
  .connect()
  .catch(err => {
    console.log('Unable to connect', err.stack);
    return res.json({result: 'Unable to update information.'});
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

      return res.json({result: 'OK'});
    }
  } catch (err) {
    console.error('Error in transaction', err.stack);
    return res.json({result: 'Unable to update information.'});
  } finally {
    client.release();
  }

}

module.exports = {
  getProfile,
  updateProfile,
  updatePassword
};