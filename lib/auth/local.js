import { User } from '../../data/connectors';

const express = require('express');
const app = express();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const credential = require('credential');

passport.use(new LocalStrategy(
  { session: false },
  function(username, password, done) {
    User
      .find({ where: {email: username}})
      .then(user => {
        if (!user) {
          return done(null, false, { message: 'Unknown user.' });
        }
        credential()
          .verify(user.password, password)
          .then(isValid => {
            if (!isValid) {
              return done(null, false, { message: 'Incorrect password.' });
            }
            let info = {
              id: user.id,
              token: new Buffer('1234567890').toString('base64')
            };
            return done(null, info);
          })
          .catch(e => done(e, null));
      })
    ;
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


/*
 * Login with the username (email) and password.
 */
app.post('/login', function(req, res) {
  passport.authenticate('local', { session: false }, function(err, user, info) {
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

module.exports = app;
