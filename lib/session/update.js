import { Session } from '../../data/connectors';

function update (id, input) {
  return Session
    .findById(id)
    .then(session => {
      if (!session) {
          throw new Error(`Unknown session '${id}'`);
      }
      Object.assign(session, input);
      return session.save();
    })
  ;
}

export default update;
