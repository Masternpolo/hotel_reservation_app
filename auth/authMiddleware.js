const jwt = require('jsonwebtoken');
const crypto = require('crypto')

const accessToken = (payload) => {
   return jwt.sign(
    payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.EXPIRES_IN
    })
}

const protect = async(req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      next(err);
    }
  } else {
 
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access only' });
  }
};

module.exports = { protect, isAdmin, accessToken };