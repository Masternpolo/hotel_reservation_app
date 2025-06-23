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
   return next(new Error('You do not have permission to perform this action', 403));
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
}

module.exports = { protect, isAdmin, accessToken };