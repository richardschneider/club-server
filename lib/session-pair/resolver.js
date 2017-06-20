// graphql resolver for a game

import { Game, Board, SessionPairResult } from '../../data/connectors';

module.exports = {

  games(sessionPair) {
    const sessionId = sessionPair.session.id;
    const q = {};
    if (sessionPair.direction === 'NS') {
      q.ns = sessionPair.table;
    } else {
      q.ew = sessionPair.table;
    }
    return Game.findAll({
      where: q,
      include: [{ model: Board, where: { sessionId } }],
    });
  },

  ranking(sessionPair) {
    return SessionPairResult
      .findById(sessionPair.id)
      .then(ranking => ranking || { rank: 0, score: 0, tied: false });
  }

};
