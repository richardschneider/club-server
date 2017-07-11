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

type SessionPlayer {
  id: ID
  session: Session
  player: Player
  table: Int
  seat: String
}

${require('../lib/user/schema')}
${require('../lib/competition/schema')}
${require('../lib/session/schema')}
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
  user(id: ID!) : User
  club(id: ID!) : Club
  competition(id: ID!) : Competition
  player(id: ID!) : Player
  board(id: ID!) : Board
  game(id: ID!) : Game
  session(id: ID!) : Session
  sessionPair(id: ID!) : SessionPair
}

type Mutation {
  createUser(
    name: String!
    email: String!
    password: String!) : User
  createClub(name: String!) : Club
  updateClub(id: ID!, input: ClubInput) : Club
  createSession(competition: ID!, title: String!, date: String!) : Session
  updateSession(id: ID!, input: SessionInput) : Session
  scoreSession(id: ID!, scoring: ScoringAlgorithm!): Session
  upsertCompetition(id: ID, input: CompetitionInput): Competition
}

schema {
  query: Query
  mutation: Mutation
}
`;

export default [typeDefinitions];
