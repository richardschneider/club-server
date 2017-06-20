module.exports = `

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
`;

