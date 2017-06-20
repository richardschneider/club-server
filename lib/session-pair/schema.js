module.exports = `


type SessionPair {
  id: ID
  session: Session
  table: Int
  direction: String
  title: String
  shortTitle: String
  ranking: Ranking!
  name: String
  players: [Player]
  games: [Game]
 }
`;

