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
  return db.addColumn('clubs', 'addressId', {
    type: 'int',
    foreignKey: {
      name: 'club_address_fk',
      table: 'addresses',
      rules: {
        onDelete: 'CASCADE',
        onUpdate: 'RESTRICT'
       },
       mapping: {
         addressId: 'id'
       }
      }
  });
};

exports.down = function(db) {
  return db.removeColumn('clubs', 'addressId');
};

exports._meta = {
  "version": 2
};
