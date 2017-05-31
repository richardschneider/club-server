import Sequelize from 'sequelize';
import casual from 'casual';
import _ from 'lodash';
import Mongoose from 'mongoose';
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
});

const SessionPlayerModel = db.define('sessionPlayer', {
  seat: { type: Sequelize.STRING },
  table: { type: Sequelize.INTEGER }
});

const BoardModel = db.define('board', {
  number: { type: Sequelize.INTEGER },
  dealer: { type: Sequelize.STRING },
  vulnerability: { type: Sequelize.STRING },
  deal: { type: Sequelize.STRING },
});

const GameModel = db.define('game', {
  level: { type: Sequelize.INTEGER },
  denomination: { type: Sequelize.STRING },
  risk: { type: Sequelize.STRING },
  declaror: { type: Sequelize.STRING },
  score: { type: Sequelize.INTEGER },
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

PlayerModel.hasMany(SessionPlayerModel)

// views in mongo DB

//const mongo = Mongoose.connect('mongodb://localhost/views');

//const ViewSchema = Mongoose.Schema({
//  postId: Number,
//  views: Number,
//});
//
//const View = Mongoose.model('views', ViewSchema);


casual.seed(123);
db.sync({ force: true }).then(() => {
    const maxPlayers = 20;
    const maxClubs = 5;
    
    // Create a set of players
    Promise.all(
        _.times(maxPlayers, () => {
            return PlayerModel.create({
                name: casual.full_name,
            });
        })
      )
    
    // Create some clubs
    .then(players => {
        _.times(maxClubs, () => {
            return ClubModel.create({
                name: casual.city,
            })
            
            // With one session
            .then(club => {
                return club.createSession({
                    title: `A session for ${club.name}`,
                });
            })
            
            // Then 4 players per session
            .then(session => {
                return session.createSessionPlayer({
                    seat: 'N',
                    table: 1,
                })
                .then(sp => sp.setPlayer(players[0]))
                .then(_ => session.createSessionPlayer({
                    seat: 'S',
                    table: 1,
                })) 
                .then(sp => sp.setPlayer(players[1]))
                .then(_ => session.createSessionPlayer({
                    seat: 'E',
                    table: 1,
                })) 
                .then(sp => sp.setPlayer(players[2]))
                .then(_ => session.createSessionPlayer({
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
            
            // With 1 game per board
            .then((boards) => {
                return Promise.all(boards.map((board) => {
                    return board.createGame({
                        level: 3,
                        denomination: 'NT',
                        risk: '',
                        declaror: 'W',
                        score: -50,
                    });
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

const FortuneCookie = {
  getOne() {
    return rp('http://fortunecookieapi.com/v1/cookie')
      .then((res) => JSON.parse(res))
      .then((res) => {
        return res[0].fortune.message;
      });
  },
};


export { Club, Player, Session, SessionPlayer, Board, FortuneCookie };
