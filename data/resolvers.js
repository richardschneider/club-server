import { Club, Player, Session, SessionPair, Board, Game, FortuneCookie, DoubleDummy } from './connectors';
import score from './score';

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
    getFortuneCookie() {
      return FortuneCookie.getOne();
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

  Session: {
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
  },

  SessionPlayer: {
    player(sessionPlayer) {
      return sessionPlayer.getPlayer();
    },
  },

  SessionPair: {
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
  },

  Board: {
    session(board) {
      return board.getSession();
    },
    games(board) {
      return board.getGames();
    },
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
            }));
    }
  },

  Game: {
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
  },

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
