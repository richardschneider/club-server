module.exports = `

type Session {
  id: ID
  title: String
  date: String
  club: Club
  boards: [Board]
  games: [Game]
  pairs: [SessionPair]
  players: [SessionPlayer]
}`;

