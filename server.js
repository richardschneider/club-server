import express from 'express';
import Schema from './data/schema';
import Resolvers from './data/resolvers';
import db from './lib/db';
import cors from 'cors';
import compression from 'compression';

import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';

const passport = require('passport');

const GRAPHQL_PORT = process.env.PORT || 3001;

const env = process.env.NODE_ENV || 'dev';

if (!process.env.BASE_URL) {
  if (env === 'dev') {
    process.env.BASE_URL = `http://localhost:${GRAPHQL_PORT}/`;
  }
  else {
    throw new Error('Missing environment variable BASE_URL');
  }
}

const app = express();
app.use(compression());
app.use(fileUpload());
app.use(express.static('public'));

app.use(passport.initialize());

app.use(cors(), bodyParser.json(), require('./lib/auth/local'));
app.use(require('./lib/auth/google'));
app.use(require('./lib/club/routes'));
app.use(require('./lib/session/routes'));

const executableSchema = makeExecutableSchema({
  typeDefs: Schema,
  resolvers: Resolvers,
  allowUndefinedInResolve: false,
  printErrors: true,
});

// `context` must be an object and can't be undefined when using connectors
app.use('/graphql', cors(), bodyParser.json(), graphqlExpress({
  schema: executableSchema,
  context: {},
}));

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));

// Fallback error handler
app.use(function (err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).send(err.message);
});

// Start the server once the database is abailable
db.sync()
  .then(() => {
    console.log('database is ready');
    app.listen(GRAPHQL_PORT, () => console.log(`Club server is now running on ${process.env.BASE_URL}`));
  })
;
