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
  return db.createTable('addresses', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    name: 'string',
    city: 'string',
    administrative: 'string',
    country: 'string',
    countryCode: 'string',
    lat: 'real',
    lng: 'real',
    postcode: 'string',
    title: 'string'
  });
};

exports.down = function(db) {
  return db.dropTable('addresses');
};

exports._meta = {
  "version": 1
};
