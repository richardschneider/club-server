import Sequelize from 'sequelize';
import db from '../lib/db';
import SessionPair from '../lib/session-pair/connector';

const ClubModel = db.define('club', {
  name: { type: Sequelize.STRING, validate: { notEmpty: true} },
});

const PlayerModel = db.define('player', {
  name: { type: Sequelize.STRING, validate: { notEmpty: true} },
});

const SessionModel = db.define('session', {
  title: { type: Sequelize.STRING, validate: { notEmpty: true} },
  date: { type: Sequelize.CHAR(10)},
});

const SessionPlayerModel = db.define('sessionPlayer', {
  seat: { type: Sequelize.CHAR(1), validate: { isIn: [['N', 'S', 'E', 'W']] } },
  table: { type: Sequelize.INTEGER },
  },
  { indexes: [
    { fields: ['sessionId'] },
    { fields: ['sessionId', 'table', 'seat'] }  // TODO: should be unique, see https://github.com/richardschneider/club-server/issues/3
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
    { fields: ['sessionId', 'number'] } // TODO: should be unique, see https://github.com/richardschneider/club-server/issues/3
  ] }
);

const GameModel = db.define('game', {
  ns: { type: Sequelize.INTEGER },
  ew: { type: Sequelize.INTEGER },
  level: { type: Sequelize.INTEGER },
  denomination: { type: Sequelize.STRING(2), validate: { isIn: [['S', 'H', 'D', 'C', 'NT']] } },
  risk: { type: Sequelize.STRING(2), validate: { isIn: [['', 'X', 'XX']] } },
  declaror: { type: Sequelize.CHAR(1), validate: { isIn: [['N', 'S', 'E', 'W']] } },
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

const Club = db.models.club;
const Player = db.models.player;
const Session = db.models.session;
const SessionPlayer = db.models.sessionPlayer;
const SessionPairResult = db.models.sessionPairResult;
const Board = db.models.board;
const Game = db.models.game;

export { Club, Player, Session, SessionPlayer, SessionPair, SessionPairResult, Board, Game};
