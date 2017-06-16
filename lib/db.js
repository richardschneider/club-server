import Sequelize from 'sequelize';

module.exports = new Sequelize('bridge-club', null, null, {
  dialect: 'sqlite',
  storage: './bridge-club.sqlite',
});
