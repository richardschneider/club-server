import { Club, Player, Session, SessionPair, Board, Game } from './connectors';
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
    game(_, args) {
      return Game.find({ where: args });
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
    createClub(_, { name }) {
      return Club.create({ name: name});
    },
    createSession(_, { club, title, date}) {
      return Club.findById(club)
        .then(club => club.createSession({ title: title, date: date }));
    },
  },

  Club: require('../lib/club/resovler'),
  Session: require('../lib/session/resolver'),

  SessionPlayer: {
    player(sessionPlayer) {
      return sessionPlayer.getPlayer();
    },
  },

  SessionPair: require('../lib/session-pair/resolver'),
  Board: require('../lib/board/resolver'),
  Game: require('../lib/game/resolver'),
  GamePairResult: require('../lib/game-pair-result/resolver'),
};

export default resolvers;
