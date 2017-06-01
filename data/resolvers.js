import { Club, Player, Session, SessionPair, Board, FortuneCookie } from './connectors';

const resolvers = {
  Query: {
    clubs() {
      return Club.findAll({});
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
    players(session) {
        return session.getSessionPlayers();
    },
    pairs(session) {
        return session.getSessionPlayers({ include: [ Player ] })
            .then(sessionPlayers => {
                var map = {};
                sessionPlayers.forEach(sp => {
                    var direction = sp.seat === 'N' || sp.seat === 'S' ? 'NS' : 'EW';
                    var name = direction + sp.table;
                    var pair = map[name] || { direction: direction, name: name, table: sp.table, players: []};
                    var player = sp.player;
                    pair.players.push(player)
                    pair.title = pair.title ? pair.title + ' / ' + player.name : player.name;
                    map[name] = pair;
                });
                return Object.getOwnPropertyNames(map).map(val => map[val]);
            });
    }
  },

  SessionPlayer: {
      player(sessionPlayer) {
          return sessionPlayer.getPlayer();
      }
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
        }
    },
    scoreNS(game) {
        return (game.declaror === 'N' || game.declaror === 'S') ? game.score : -game.score
    },
    scoreEW(game) {
        return (game.declaror === 'E' || game.declaror === 'W') ? game.score : -game.score
    },
   },

//    views(post) {
//      return View.findOne({ postId: post.id }).then((view) => view.views);
//    },
};

export default resolvers;
