// graphql resolver for a game

import { Address } from '../../data/connectors';

module.exports = {

  sessions(club) {
    return club.getSessions();
  },

  address(club) {
    return Address
      .findById(club.addressId)
      .then(addr => addr || null);
  }

};
