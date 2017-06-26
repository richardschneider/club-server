import Sequelize from 'sequelize';

const env = process.env.NODE_ENV || 'dev';

module.exports = new Sequelize('bridge-club', null, null, {
  dialect: 'sqlite',
  storage: './bridge-club.sqlite',
  logging: env === 'dev' ? console.log : false,
});
