const typeDefinitions = `

type Player {
  id: ID
  name: String
}

# the order in a competition
type Ranking {
  # position in the ladder
  rank: Int

  # tied with another player(s)
  tied: Boolean

  # score used to calculate rank
  score: Float

  scale: Float
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

${require('../lib/club/schema')}
${require('../lib/session-pair/schema')}
${require('../lib/board/schema')}
${require('../lib/game/schema')}
${require('../lib/address/schema')}

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
  game(id: ID!) : Game
  session(id: ID!) : Session
  sessionPair(id: ID!) : SessionPair
}

type Mutation {
  createClub(name: String!) : Club
  createSession(club: ID!, title: String!, date: String!) : Session
  scoreSession(id: ID!, scoring: ScoringAlgorithm!): Session
}

schema {
  query: Query
  mutation: Mutation
}
`;

export default [typeDefinitions];
