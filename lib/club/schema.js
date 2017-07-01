module.exports = `

type Club {
  id: ID!
  name: String!
  address: Address
  sessions: [Session]
}

input ClubInput {
  name: String
  address: AddressInput
}
`;
