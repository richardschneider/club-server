// graphql resolver for a game

import { Game, Board, SessionPair } from '../../data/connectors';

module.exports = {

   club(session) {
      return session.getClub();
    },

    boards(session) {
      return session.getBoards();
    },

    games(session) {
      return Game.findAll({
        include: [{ model: Board, where: { sessionId: session.id } }],
      });
    },

    players(session) {
      return session.getSessionPlayers();
    },

    pairs(session) {
      return SessionPair.getAll(session);
    },

};
