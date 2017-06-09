import Sequelize from 'sequelize';
import casual from 'casual';
import _ from 'lodash';
import rp from 'request-promise';
import bridge from 'bridge.js';

const db = new Sequelize('blog', null, null, {
  dialect: 'sqlite',
  storage: './blog.sqlite',
});

const ClubModel = db.define('club', {
  name: { type: Sequelize.STRING },
});

const PlayerModel = db.define('player', {
  name: { type: Sequelize.STRING },
});

const SessionModel = db.define('session', {
  title: { type: Sequelize.STRING },
  date: { type: Sequelize.STRING},
});

const SessionPlayerModel = db.define('sessionPlayer', {
  seat: { type: Sequelize.STRING },
  table: { type: Sequelize.INTEGER },
});

const BoardModel = db.define('board', {
  number: { type: Sequelize.INTEGER },
  dealer: { type: Sequelize.STRING },
  vulnerability: { type: Sequelize.STRING },
  deal: { type: Sequelize.STRING },
});

const GameModel = db.define('game', {
  ns: { type: Sequelize.INTEGER },
  ew: { type: Sequelize.INTEGER },
  level: { type: Sequelize.INTEGER },
  denomination: { type: Sequelize.STRING },
  risk: { type: Sequelize.STRING },
  declaror: { type: Sequelize.STRING },
  score: { type: Sequelize.INTEGER },
  made: { type: Sequelize.INTEGER },
});

ClubModel.hasMany(SessionModel);
SessionModel.belongsTo(ClubModel);
SessionModel.hasMany(BoardModel);
SessionModel.hasMany(SessionPlayerModel);
SessionPlayerModel.belongsTo(SessionModel);
SessionPlayerModel.belongsTo(PlayerModel);
BoardModel.belongsTo(SessionModel);
BoardModel.hasMany(GameModel);
GameModel.belongsTo(BoardModel);

PlayerModel.hasMany(SessionPlayerModel);

casual.seed(123);
db.sync({ force: true }).then(() => {
  const maxPlayers = 20;
  const maxClubs = 30;

  // Create a set of players
  Promise.all(
    _.times(maxPlayers, () => PlayerModel.create({ name: casual.full_name, }))
  )

    // Create some clubs
    .then((players) => {
      _.times(maxClubs, () => {
        return ClubModel.create({
          name: casual.city,
        })

            // With one session
            .then((club) => {
              return club.createSession({
                title: `${casual.last_name} Cup`,
                date: casual.date('YYYY-MM-DD'),
              });
            })

            // Then 4 players per session
            .then((session) => {
              return session.createSessionPlayer({
                seat: 'N',
                table: 1,
              })
              .then(sp => sp.setPlayer(players[0]))
              .then(() => session.createSessionPlayer({
                seat: 'S',
                table: 1,
              }))
              .then(sp => sp.setPlayer(players[1]))
              .then(() => session.createSessionPlayer({
                seat: 'E',
                table: 1,
              }))
              .then(sp => sp.setPlayer(players[4]))
              .then(() => session.createSessionPlayer({
                seat: 'E',
                table: 2,
              }))
              .then(sp => sp.setPlayer(players[5]))
              .then(() => session.createSessionPlayer({
                seat: 'W',
                table: 2,
              }))
              .then(sp => sp.setPlayer(players[6]))
              .then(() => session.createSessionPlayer({
                seat: 'N',
                table: 2,
              }))
              .then(sp => sp.setPlayer(players[7]))
              .then(() => session.createSessionPlayer({
                seat: 'S',
                table: 2,
              }))

              .then(sp => sp.setPlayer(players[2]))
              .then(() => session.createSessionPlayer({
                seat: 'W',
                table: 1,
              }))
              .then(sp => sp.setPlayer(players[3]))
              .then(() => session);
            })

            // With 2 boards per session
            .then((session) => {
              return Promise.all(bridge.Session.generateBoards(2).boards.map((b) => {
                return session.createBoard({
                  number: b.number,
                  dealer: b.dealer.symbol,
                  vulnerability: b.vulnerability,
                  deal: bridge.pbn.exportDeal(b.hands, b.dealer),
                });
              }));
            })

            // With 2 games per board
            .then((boards) => {
              return Promise.all(boards.map((board) => {
                return board.createGame({
                  ns: 1,
                  ew: 1,
                  level: 3,
                  denomination: 'NT',
                  risk: '',
                  declaror: 'W',
                  score: -50,
                  made: -1,
                })
                .then(() => board.createGame({
                  ns: 2,
                  ew: 2,
                  level: 3,
                  denomination: 'NT',
                  risk: 'X',
                  declaror: 'W',
                  score: -100,
                  made: -2,
                }))
                ;
              }));
            });
      });
    });
});

const Club = db.models.club;
const Player = db.models.player;
const Session = db.models.session;
const SessionPlayer = db.models.session;
const Board = db.models.board;
const Game = db.models.game;

const FortuneCookie = {
  getOne() {
    return rp('http://fortunecookieapi.com/v1/cookie')
      .then(res => JSON.parse(res))
      .then((res) => {
        return res[0].fortune.message;
      });
  },
};

const DoubleDummy = {
    solve(board) {
        let options = {
            url: 'http://dds-3.apphb.com/api/contracts',
            qs: {
                pbn: board.deal
            }
        };
        return rp(options)
            .then(res => JSON.parse(res))
            .catch(e => {
                console.error('DDS failure');
                console.error(e);
                throw e;
            });
    },
};

const SessionPair = {};
SessionPair.getAll = function (session) {
  return session
        .getSessionPlayers({ include: [Player] })
        .then(sessionPlayers => SessionPair.fromSessionPlayers(session, sessionPlayers));
};
SessionPair.getPair = function (session, direction, table) {
  const q = { table, seat: { $in: Array.from(direction) } };
  return session
        .getSessionPlayers({ where: q, include: [Player] })
        .then(sessionPlayers => SessionPair.fromSessionPlayers(session, sessionPlayers))
        .then(pairs => pairs[0])
    ;
};
SessionPair.fromSessionPlayers = function (session, sessionPlayers) {
  const map = {};
  sessionPlayers.forEach((sp) => {
    const direction = sp.seat === 'N' || sp.seat === 'S' ? 'NS' : 'EW';
    const name = direction + sp.table;
    const pair = map[name] || {
      session,
      direction,
      name,
      table: sp.table,
      players: [] };
    const player = sp.player;
    pair.players.push(player);
    pair.title = pair.title ? `${pair.title} / ${player.name}` : player.name;
    map[name] = pair;
  });
  return Object.getOwnPropertyNames(map).map(val => map[val]);
};

export { Club, Player, Session, SessionPlayer, SessionPair, Board, Game, FortuneCookie, DoubleDummy };
