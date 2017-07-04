module.exports = `

type User {
  id: ID!
  name: String!
  email: String!
}

input UserInput {
  name: String
  email: String
}

`;
