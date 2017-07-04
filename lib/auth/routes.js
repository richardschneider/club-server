const express = require('express');
const app = express();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  { session: false },
  function(username, password, done) {
    if (password !== 'xyzzy') {
      return done(null, false, { message: 'Incorrect password.' });
    }
    let user = {
      token: new Buffer('1234567890').toString('base64')
    };
    return done(null, user);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


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