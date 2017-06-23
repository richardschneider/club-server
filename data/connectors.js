import Sequelize from 'sequelize';
import casual from 'casual';
import _ from 'lodash';
import bridge from 'bridge.js';
import db from '../lib/db';
import SessionPair from '../lib/session-pair/connector';

const ClubModel = db.define('club', {
  name: { type: Sequelize.STRING },
});

const PlayerModel = db.define('player', {
  name: { type: Sequelize.STRING },
});

const SessionModel = db.define('session', {
  title: { type: Sequelize.STRING },
  date: { type: Sequelize.CHAR(10)},
});

const SessionPlayerModel = db.define('sessionPlayer', {
  seat: { type: Sequelize.CHAR(1), validate: { isIn: [['N', 'S', 'E', 'W']] } },
  table: { type: Sequelize.INTEGER },
  },
  { indexes: [
    { fields: ['sessionId'] },
    { fields: ['sessionId', 'table', 'seat'], unique: true}
  ] }
);

/* const SessionPairResultModel = */ db.define('sessionPairResult', {
  id: { type: Sequelize.STRING, primaryKey: true },
  rank: { type: Sequelize.INTEGER },
  tied: { type: Sequelize.BOOLEAN },
  score: { type: Sequelize.FLOAT },
  scale: { type: Sequelize.FLOAT }
});

const BoardModel = db.define('board', {
  number: { type: Sequelize.INTEGER },
  dealer: { type: Sequelize.CHAR(1), validate: { isIn: [['N', 'S', 'E', 'W']] } },
  vulnerability: { type: Sequelize.STRING(3), validate: { isIn: [['Nil', 'All', 'NS', 'EW']] } },
  deal: { type: Sequelize.STRING },
  },
  { indexes: [
    { fields: ['sessionId'] },
    { fields: ['sessionId', 'number'], unique: true}
  ] }
);

const GameModel = db.define('game', {
  ns: { type: Sequelize.INTEGER },
  ew: { type: Sequelize.INTEGER },
  level: { type: Sequelize.INTEGER },
  denomination: { type: Sequelize.STRING(2), validate: { isIn: [['S', 'H', 'D', 'C', 'NT']] } },
  risk: { type: Sequelize.STRING(2), validate: { isIn: [['', 'X', 'XX']] } },
  declaror: { type: Sequelize.CHAR(1), validate: { isIn: [['N', 'S', 'E', 'W']] } },
  lead: { type: Sequelize.CHAR(2) },
  score: { type: Sequelize.INTEGER },
  made: { type: Sequelize.INTEGER },
  matchpointsNS : { type: Sequelize.FLOAT },
  matchpointsEW : { type: Sequelize.FLOAT },
  matchpointsPercentageNS : { type: Sequelize.FLOAT },
  matchpointsPercentageEW : { type: Sequelize.FLOAT },
  impsNS : { type: Sequelize.FLOAT },
  impsEW : { type: Sequelize.FLOAT },
  sessionId : { type: Sequelize.INTEGER, allowNull: false },
  auction: { type: Sequelize.STRING },
  play: { type: Sequelize.STRING },
  },
  { indexes: [
    { fields: ['boardId'] }
  ] }
);


ClubModel.hasMany(SessionModel);
SessionModel.belongsTo(ClubModel);
SessionModel.hasMany(BoardModel);
SessionModel.hasMany(GameModel);
SessionModel.hasMany(SessionPlayerModel);
SessionPlayerModel.belongsTo(SessionModel);
SessionPlayerModel.belongsTo(PlayerModel);
BoardModel.belongsTo(SessionModel);
BoardModel.hasMany(GameModel);
GameModel.belongsTo(BoardModel);
GameModel.belongsTo(SessionModel);
PlayerModel.hasMany(SessionPlayerModel);

casual.seed(123);
db.sync({ force: true }).then(() => {
  const maxPlayers = 20;
  const maxClubs = 5;

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

            .then((club) => {
              let name = casual.last_name;
              return club.createSession({
                title: `${name} Cup (NP)`,
                date: '2017-06-06',
              })
              .then(() => club.createSession({
                title: `${name} Cup (NP)`,
                date: '2017-06-13',
              }))
              .then(() => club);
            })

          // With one played session
            .then((club) => {
              return club.createSession({
                title: `${casual.last_name} Cup`,
                date: '2017-06-04',
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
                  deal: b.deal(),
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
                  lead: 'SK',
                  sessionId: board.sessionId,
                })
                .then(() => board.createGame({
                  ns: 2,
                  ew: 2,
                  level: 3,
                  denomination: 'H',
                  risk: 'X',
                  declaror: 'W',
                  score: -100,
                  made: -2,
                  lead: 'D8',
                  sessionId: board.sessionId,
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
const SessionPlayer = db.models.sessionPlayer;
const SessionPairResult = db.models.sessionPairResult;
const Board = db.models.board;
const Game = db.models.game;

export { Club, Player, Session, SessionPlayer, SessionPair, SessionPairResult, Board, Game};
