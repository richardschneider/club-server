const vCard = require('vcards-js');

function vcard (club, card) {
  card = card || vCard();

  // Note: Android doesn't grok card.version = '4.0';
  card.firstName = club.name;
  card.formattedName = club.name;
  card.homePhone = club.phone;
  card.email = club.email;
  if (club.address) {
    card.homeAddress.street = club.address.name;
    card.homeAddress.city = club.address.city;
    card.homeAddress.stateProvince = club.address.administrative;
    card.homeAddress.postalCode = club.address.postcode;
    card.homeAddress.countryRegion = club.address.country;
  }

  return card;
}

export default vcard;
