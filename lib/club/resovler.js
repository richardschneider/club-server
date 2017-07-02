// graphql resolver for a game

import { Address } from '../../data/connectors';
import vcard from './vcard';

module.exports = {

  sessions(club) {
    return club.getSessions();
  },

  address(club) {
    return Address
      .findById(club.addressId)
      .then(addr => addr || null);
  },

  vcard(club) {
      return club
        .getAddress()
        .then(addr => {
          club.address = addr;
          return vcard(club).getFormattedString();
        })
      ;
  }

};
