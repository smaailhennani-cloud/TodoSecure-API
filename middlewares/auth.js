const jwt = require('jsonwebtoken');

/**
 * Middleware d'authentification
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Accès interdit' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.user = user;
    next();
  });
};
