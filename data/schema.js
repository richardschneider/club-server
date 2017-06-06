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
  date: String
  club: Club
  boards: [Board]
  games: [Game]
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
  table: Int
  direction: String
  title: String
  name: String
  players: [Player]
  games: [Game]
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

  # the declaror's score based on the contract and made tricks
  score: Int

  # the number of tricks made over the book contract (6) or a negative number indicating the number of tricks down on the contract
  made: Int

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
  club(id: ID!) : Club
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
