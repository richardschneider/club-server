module.exports = `

type Club {
  id: ID!
  name: String!
  email: String
  address: Address
  sessions: [Session]
}

input ClubInput {
  name: String
  email: String
  address: AddressInput
}
`;
