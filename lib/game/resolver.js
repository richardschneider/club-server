// graphql resolver for a game

module.exports = {

   board(game) {
      return game.getBoard();
    },

    contract(game) {
      return {
        level: game.level,
        denomination: game.denomination,
        risk: game.risk,
        declaror: game.declaror,
      };
    },

    NS(game) {
      return {
          game: game,
          pairNumber: game.ns,
          direction: 'NS',
          score: (game.declaror === 'N' || game.declaror === 'S') ? game.score : -game.score,
          matchpoints: game.matchpointsNS,
          matchpointsPercentage: game.matchpointsPercentageNS,
          imps: game.impsNS,
      };
    },

    EW(game) {
      return {
          game: game,
          pairNumber: game.ew,
          direction: 'EW',
          score: (game.declaror === 'E' || game.declaror === 'W') ? game.score : -game.score,
          matchpoints: game.matchpointsEW,
          matchpointsPercentage: game.matchpointsPercentageEW,
          imps: game.impsEW
      };
    },

};
