import { Competition } from '../../data/connectors';

function update (id, input) {
  return Competition
    .findOrBuild({where: { id: id}})
    .then(result => {
      let competition = result[0] /*, wasCreated = result[1] */;
      Object.assign(competition, input);
      return competition.save();
    })
  ;
}

export default update;
