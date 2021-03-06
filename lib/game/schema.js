module.exports = `

type Game {
  id: ID
  board: Board
  session: Session
  contract: Contract
  lead: String
  auction: String
  play: String

  # the declaror's score based on the contract and made tricks
  score: Int

  # the number of tricks made over the book contract (6) or a negative number indicating the number of tricks down on the contract
  made: Int

  NS: GamePairResult
  EW: GamePairResult
}
`;

