import { Club, Player, Session, SessionPair, Board, Game, FortuneCookie } from './connectors';

const resolvers = {
  Query: {
    clubs() {
      return Club.findAll({});
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
    getFortuneCookie(){
      return FortuneCookie.getOne();
    }
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
           include: [{model: Board, where: {sessionId: session.id}}] 
        });
    },
    players(session) {
        return session.getSessionPlayers();
    },
    pairs(session) {
        return SessionPair.getAll(session);
    }
  },

  SessionPlayer: {
      player(sessionPlayer) {
          return sessionPlayer.getPlayer();
      }
  },
  
  SessionPair: {
     games(sessionPair) {
        var sessionId = sessionPair.session.id;
        var q = {};
        if (sessionPair.direction === 'NS') {
            q.ns = sessionPair.table;
        } else {
            q.ew = sessionPair.table;
        }
       return Game.findAll({
           where: q,
           include: [{model: Board, where: {sessionId: sessionId}}] 
        });
    },     
  },
    
  Board: {
    session(board) {
      return board.getSession();
    },
    games(board) {
      return board.getGames();
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
    scoreNS(game) {
        return (game.declaror === 'N' || game.declaror === 'S') ? game.score : -game.score;
    },
    scoreEW(game) {
        return (game.declaror === 'E' || game.declaror === 'W') ? game.score : -game.score;
    },
    NS(game) {
        return game.getBoard()
            .then(board => board.getSession())
            .then(session => SessionPair.getPair(session, 'NS', game.ns))
        ;
    },
    EW(game) {
        return game.getBoard()
            .then(board => board.getSession())
            .then(session => SessionPair.getPair(session, 'EW', game.ew))
        ;
    },
  },

};

export default resolvers;
