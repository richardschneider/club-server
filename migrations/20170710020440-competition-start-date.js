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
  return db.addColumn('competitions', 'startDate', {
    type: 'string',
    notNull: true,
    defaultValue: '2017-08-13'
  });
};

exports.down = function(db) {
  return db.removeColumn('competitions', 'startDate');
};

exports._meta = {
  "version": 1
};
