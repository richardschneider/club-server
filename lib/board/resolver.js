// graphql resolver for a board

const DoubleDummy = require('../double-dummy/connector');

module.exports = {

    // get the session associated with the board
    session(board) {
      return board.getSession();
    },

    // get the played games
    games(board) {
      return board.getGames();
    },

    // get the possible contracts of the board
    solutions(board) {
      return DoubleDummy
        .solve(board)
        .then(contracts => contracts.map(c => {
            return {
              risk: '',
              level: c.level,
              denomination: c.denomination === 'noTrumps' ? 'NT' : c.denomination[0].toUpperCase(),
              declaror: c.declaror[0].toUpperCase(),
            };
        }))
      ;
    }

};
