/*
 * Login via google
 */

import { User } from '../../data/connectors';

const express = require('express');
const app = express();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

let useGoogle = true;
if (!process.env.GOOGLE_CLIENT_ID) {
  console.error('Missing environment variable GOOGLE_CLIENT_ID');
  useGoogle = false;
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.error('Missing environment variable GOOGLE_CLIENT_SECRET');
  useGoogle = false;
}

if (useGoogle) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3001/auth/google/callback'
    },
    function(token, refreshToken, profile, done) {
      let email = profile.emails[0].value;
      User
        .findOne({ where: {email: email}})
        .then(user => {
          if (!user) {
            return User.create({
              name: profile.displayName,
              email: email
            });
          }
          return user;
        })
        .then(user => {
          let info = {
            id: user.id,
            token: new Buffer('1234567890').toString('base64')
          };
          return done(null, info);
        })
        .catch(e => done(e, null));
    }
  ));

  app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

  // the callback after google has authenticated the user
  app.get('/auth/google/callback', function (req, res) {
    passport.authenticate('google', function(err, user, info) {
      if (err) {
        return res.status(500).json(err);
      }
      if (!user) {
        return res.status(422).json(info);
      }
      let result = {
        authorization: `Bearer ${user.token}`
      };
      res.json(result);
    })(req, res);
  });
}

if (!useGoogle) {
  app.get('/auth/google', function (req, res) {
    res.status(500).send('Google login is not supported.');
  });
}

module.exports = app;
