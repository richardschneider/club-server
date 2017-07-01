module.exports = `

type Address {
  id: ID
  name: String,
  city: String,
  administrative: String,
  country: String,
  countryCode: String,
  lat: Float,
  lng: Float,
  postcode: String,
  title: String
}

input AddressInput {
  name: String,
  city: String,
  administrative: String,
  country: String,
  countryCode: String,
  lat: Float,
  lng: Float,
  postcode: String,
  title: String
}
`;
