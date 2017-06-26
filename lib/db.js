import Sequelize from 'sequelize';

const env = process.env.NODE_ENV || 'dev';
let db;

// when hosted by Heroku, use postgresql
if (process.env.DATABASE_URL) {
  db = new Sequelize(process.env.DATABASE_URL, {
    dialect:  'postgres',
    logging: env === 'dev' ? console.log : false,
  });

// devs use sqlite on local machines
} else if (env === 'dev') {
  db = new Sequelize('bridge-club', null, null, {
    dialect: 'sqlite',
    storage: './bridge-club.sqlite',
    logging: env === 'dev' ? console.log : false,
  });
}

if (!db) {
    throw new Error('Cannot determine database for the environment');
}

module.exports = db;
