const typeDefinitions = `


type Club {
  id: ID
  name: String
  sessions: [Session]
}

type Session {
  id: ID
  title: String
  club: Club
  boards: [Board]
}

type Board {
  id: ID
  session: Session
  number: Int
  dealer: String
  vulnerability: String
  deal: String
}

type Query {
  clubs: [Club]
  getFortuneCookie: String
}

schema {
  query: Query
}
`;

export default [typeDefinitions];
