'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db
    .createTable('competitions', {
      id: { type: 'int', primaryKey: true, autoIncrement: true },
      clubId: {type: 'int', notNull: true },
      name: { type: 'string', notNull: true },
      type: { type: 'string', notNull: true }
    })
    .then(() => db.addIndex('competitions', 'competitions_club', ['clubId']))
    .then(() => db.addColumn('sessions', 'competitionId', { type: 'int' }))
    .then(() => db.addIndex('sessions', 'sessions_competition', ['clubId']))
  ;
};

exports.down = function(db) {
  return db
    .removeIndex('sessions', 'sessions_competition')
    .then(() => db.removeColumn('sessions', 'competitionId'))
    .then(() => db.dropTable('competitions'))
  ;
};

exports._meta = {
  "version": 1
};
