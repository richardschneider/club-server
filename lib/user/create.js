import { User } from '../../data/connectors';

function create (name, email) {
  // TODO: send email to verify registration
  return User.create({ name: name, email: email});
}

export default create;
