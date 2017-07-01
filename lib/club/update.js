import { Club } from '../../data/connectors';

function update (id, input) {
  return Club
    .findById(id)
    .then(club => {
      if (!club) {
          throw new Error(`Unknown club '${id}'`);
      }
      Object.assign(club, input);
      return club.save();
    })
    .then(club => {
      if (!input.address) {
          return club;
      }
      if (club.addressId) {
          return club.getAddress().then(addr => {
              Object.assign(addr, input.address);
              return addr.save().then(() => club);
          });
      }
      return club.createAddress(input.address).then(() => club);
    })
  ;
}

export default update;
