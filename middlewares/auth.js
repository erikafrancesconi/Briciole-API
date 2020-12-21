const redis = require('../redis');

const requireAuth = (req, res, next) => {
  const { authorization } = req.headers;
  const userId = req.params.id;

  if (!authorization) {
    return res.status(401).json('Unauthorized');
  }

  return redis.client.get(authorization, (err, reply) => {
    if (err || !reply || (userId && userId !== reply)) {
      return res.status(401).json('Unauthorized');
    }

    console.log('OK');
    return next();
  })
}

module.exports = {
  requireAuth
}