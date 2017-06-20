import { Club, Player, Session, SessionPair, Board } from './connectors';
import score from '../lib/session/score';

const resolvers = {
  Query: {
    clubs() {
      return Club.findAll({
        order: [
          ['name', 'ASC']
        ],
      });
    },
    club(_, args) {
      return Club.find({ where: args });
    },
    player(_, args) {
      return Player.find({ where: args });
    },
    board(_, args) {
      return Board.find({ where: args });
    },
    session(_, args) {
      return Session.find({ where: args });
    },
    sessionPair(_, args) {
      return SessionPair.getPairById(args.id);
    },
  },

  Mutation: {
    scoreSession(_, { id, scoring}) {
      return Session.find({ where: {id: id} })
        .then(session => score(session, scoring));
    },
  },

  Club: {
    sessions(club) {
      return club.getSessions();
    },
  },

  Session: require('../lib/session/resolver'),

  SessionPlayer: {
    player(sessionPlayer) {
      return sessionPlayer.getPlayer();
    },
  },

  SessionPair: require('../lib/session-pair/resolver'),
  Board: require('../lib/board/resolver'),
  Game: require('../lib/game/resolver'),

  GamePairResult: {
    pair(gamePairResult) {
      return gamePairResult.game.getBoard()
            .then(board => board.getSession())
            .then(session => SessionPair.getPair(session, gamePairResult.direction, gamePairResult.pairNumber))
        ;
    },

  },
};

export default resolvers;
