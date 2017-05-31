const typeDefinitions = `


type Club {
  id: ID
  name: String
  sessions: [Session]
}

type Player {
  id: ID
  name: String
}

type Session {
  id: ID
  title: String
  club: Club
  boards: [Board]
  pairs: [SessionPair]
  players: [SessionPlayer]
}

type SessionPlayer {
  id: ID
  session: Session
  player: Player
  table: Int
  seat: String
}

type SessionPair {
  session: Session
  number: Int
  title: String
  name: String
  direction: String
  players: [SessionPlayer]
 }

type Board {
  id: ID
  session: Session
  number: Int
  dealer: String
  vulnerability: String
  deal: String
  games: [Game]
}

type Game {
  id: ID
  board: Board
  contract: Contract
  score: Int
  scoreNS: Int
  scoreEW: Int
  NS: SessionPair
  EW: SessionPair
}

type Contract {
  level: Int
  denomination: String
  declaror: String
  risk: String
}

type Query {
  clubs: [Club]
  player(id: ID!) : Player
  board(id: ID!) : Board
  session(id: ID!) : Session
  getFortuneCookie: String
}

schema {
  query: Query
}
`;

export default [typeDefinitions];
