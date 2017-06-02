import express from 'express';
import Schema from './data/schema';
import Resolvers from './data/resolvers';
import cors from 'cors';
import compression from 'compression';
// import Mocks from './data/mocks';

import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import bodyParser from 'body-parser';

const GRAPHQL_PORT = 3001;

const graphQLServer = express();
graphQLServer.use(compression())

const executableSchema = makeExecutableSchema({
  typeDefs: Schema,
  resolvers: Resolvers,
  allowUndefinedInResolve: false,
  printErrors: true,
});

// addMockFunctionsToSchema({
//   schema: executableSchema,
//   mocks: Mocks,
//   preserveResolvers: true,
// });

// `context` must be an object and can't be undefined when using connectors
graphQLServer.use('/graphql', cors(), bodyParser.json(), graphqlExpress({
  schema: executableSchema,
  context: {},
}));

graphQLServer.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));

graphQLServer.listen(GRAPHQL_PORT, () => console.log(
  `GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}/graphql`
));
