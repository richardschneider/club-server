/*
 * JWT Token creation and verification for a user
 */
const jwt = require('jsonwebtoken');
const issuer = 'bridge-hub';

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error('Missing environment variable JWT_SECRET');
}


module.exports = {

  scheme: 'JWT',

  create (user) {
    let payload = {
      id: user.id,
      name: user.name
    };
    let options = {
      issuer: issuer
    };
    return jwt.sign(payload, secret, options);
  }

};
