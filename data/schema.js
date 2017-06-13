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
  id: ID
  session: Session
  table: Int
  direction: String
  title: String
  shortTitle: String
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
  solutions: [Contract]
}

type Game {
  id: ID
  board: Board
  contract: Contract
  lead: String

  # the declaror's score based on the contract and made tricks
  score: Int

  # the number of tricks made over the book contract (6) or a negative number indicating the number of tricks down on the contract
  made: Int

  NS: GamePairResult
  EW: GamePairResult
}

type GamePairResult {
  pair: SessionPair
  score: Int
  matchpoints: Float
  matchpointsPercentage: Float
  imps: Float
}

type Contract {
  level: Int
  denomination: String
  declaror: String
  risk: String
}

enum ScoringAlgorithm {
  matchpoints
  matchpointsACBL
  crossImps
  butler
}

type Query {
  clubs: [Club]
  club(id: ID!) : Club
  player(id: ID!) : Player
  board(id: ID!) : Board
  session(id: ID!) : Session
  sessionPair(id: ID!) : SessionPair
  getFortuneCookie: String
}

type Mutation {
  scoreSession(id: ID!, scoring: ScoringAlgorithm!): Session
}

schema {
  query: Query
  mutation: Mutation
}
`;

export default [typeDefinitions];
