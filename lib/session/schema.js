module.exports = `

# A period of play during which those entered in an event play designated boards and opponents.
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

