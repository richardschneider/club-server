import { User } from '../../data/connectors';
import credential from 'credential';

function create (name, email, password) {
  // TODO: send email to verify registration
  return credential().hash(password)
    .then(hash => User.create({ name: name, email: email, password: hash}))
  ;
}

export default create;
