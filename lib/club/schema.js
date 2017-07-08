module.exports = `

type Club {
  id: ID!
  name: String!
  email: String
  phone: String
  address: Address
  sessions: [Session]
  competitions: [Competition]
  vcard: String
}

input ClubInput {
  name: String
  email: String
  phone: String
  address: AddressInput
}
`;
