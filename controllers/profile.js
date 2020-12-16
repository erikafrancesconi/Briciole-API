const db = require('../db');

const getProfile = async function(req, res) {
  const userId = req.params.id;
  console.log(userId);

  const client = await db
  .connect()
  .catch(err => {
    console.log('Unable to connect', err.stack);
    return res.json({error: 'Something went wrong.'});
  });

  try {
    let text = `SELECT fullname, email, joined FROM users WHERE users.id = $1`;
    const resp = await client.query(text, [userId]);
    console.log(resp);

    if (resp.rowCount === 1) {
      return res.json(resp.rows[0]);
    }
  } catch (err) {
    return res.json({error: err});
  } finally {
    client.release();
  }
}

module.exports = {
  getProfile: getProfile
};