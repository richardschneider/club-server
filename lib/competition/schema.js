module.exports = `

enum CompetitionType {
  club
  tournament
  casual
}

# An organised bridge competition, sometimes called an event.
type Competition {
  id: ID
  name: String
  type: CompetitionType
  club: Club
  sessions: [Session]
}

# An organised bridge competition, sometimes called an event.
input CompetitionInput {
  name: String
  type: CompetitionType
  clubId: ID
}
`;
