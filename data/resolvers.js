import { Club, Player, Session, SessionPair, Board, Game, User, Competition } from './connectors';
import score from '../lib/session/score';
import clubUpdate from '../lib/club/update';
import userCreate from '../lib/user/create';
import competitionUpsert from '../lib/competition/upsert';

const resolvers = {
  Query: {
    clubs() {
      return Club.findAll({
        order: [
          ['name', 'ASC']
        ],
      });
    },
    user(_, args) {
      return User.findOne({ where: args });
    },
    club(_, args) {
      return Club.findOne({ where: args });
    },
    competition(_, args) {
      return Competition.findOne({ where: args });
    },
    player(_, args) {
      return Player.findOne({ where: args });
    },
    board(_, args) {
      return Board.findOne({ where: args });
    },
    game(_, args) {
      return Game.findOne({ where: args });
    },
    session(_, args) {
      return Session.findOne({ where: args });
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
    createUser(_, { name, email, password }) {
      return userCreate(name, email, password);
    },
    createClub(_, { name }) {
      return Club.create({ name: name});
    },
    createSession(_, { competition, title, date}) {
      return Competition.findById(competition)
        .then(competition => competition.createSession({ title: title, date: date, clubId: competition.clubId }));
    },
    updateClub(_, { id, input }) {
      return clubUpdate(id, input);
    },
    upsertCompetition(_, { id, input }) {
      return competitionUpsert(id, input);
    },
  },

  Club: require('../lib/club/resovler'),
  Competition: require('../lib/competition/resolver'),
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
