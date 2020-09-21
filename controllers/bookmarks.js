const db = require('../db');

const addBookmark = async function(req, res) {
  const { userid, url } = req.body;
  console.log(req.body);

  if (!userid || ! url) {
    return res.json({result: 'Wrong Parameters.'});
  }

  const client = await db
  .connect()
  .catch(err => {
    console.log('Unable to connect', err.stack);
    return res.json({result: 'Unable to save bookmark.'});
  });

  try {
    let text = 'SELECT id FROM bookmarks WHERE userid = $1 AND url = $2';
    let resp = await client.query(text, [userid, url]);

    if (resp.rowCount === 1) {
      return res.json({result: 'URL already exists.'});
    }

    text = 'INSERT INTO bookmarks (userid, url) VALUES ($1, $2) RETURNING id';
    resp = await client.query(text, [userid, url]);
    console.log(resp.rows[0].id);

    return res.json({result: 'OK'});
    
  } catch (err) {
    console.log('Unable to save bookmark.', err.stack);
    return res.json({result: 'Unable to save bookmark.'});
  } finally {
    client.release();
  }
}

const getBookmarks = async function(req, res) {
  const { userid } = req.params;

  if (!userid) {
    return res.json({result: 'No userid supplied'});
  }

  const client = await db
  .connect()
  .catch(err => {
    console.log('Unable to connect', err.stack);
    return res.json({result: 'Unable to get bookmarks.'});
  });

  try {
    let text = 'SELECT id, url FROM bookmarks WHERE userid = $1';
    let resp = await client.query(text, [userid]);
    console.log(resp.rows);

    return res.json({result: 'OK', rows: resp.rows});
    
  } catch (err) {
    console.log('Unable to get bookmarks.', err.stack);
    return res.json({result: 'Unable to get bookmarks.'});
  } finally {
    client.release();
  }

}

module.exports = {
  addBookmark: addBookmark,
  getBookmarks: getBookmarks
};