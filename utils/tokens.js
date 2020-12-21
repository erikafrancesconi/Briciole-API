const redis = require('../redis');
const jwt = require('jsonwebtoken');

const generateToken = async data => {
  const { id, email } = data;
  try {
    const token = jwt.sign({ email }, process.env.JWT_PASSPHRASE);
    await redis.set(token, id);
    redis.expire(token, 60 * 60 * 24 * 7); // Una settimana

    return token;
  } catch (err) {
    return 'ERROR';
  }
}

const getIdFromToken = async token => {
  try {
    const id = await redis.get(token);
    redis.expire(token, 60 * 60 * 24 * 7); // Allungo di una settimana

    return id;
  } catch (error) {
    console.log('Error while reading token', error);
    return 'ERROR';
  }
}

module.exports = {
  generateToken,
  getIdFromToken
}