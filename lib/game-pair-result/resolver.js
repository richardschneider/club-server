import SessionPair from '../session-pair/connector';

module.exports = {

    pair(gamePairResult) {
      let id = `${gamePairResult.game.sessionId}-${gamePairResult.direction}-${gamePairResult.pairNumber}`;
      return SessionPair.getPairById(id);
    },

};
