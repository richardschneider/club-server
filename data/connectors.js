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

const SessionModel = db.define('session', {
  title: { type: Sequelize.STRING },
});

const BoardModel = db.define('board', {
  number: { type: Sequelize.INTEGER },
  dealer: { type: Sequelize.STRING },
  vulnerability: { type: Sequelize.STRING },
  deal: { type: Sequelize.STRING },
});

ClubModel.hasMany(SessionModel);
SessionModel.belongsTo(ClubModel);
SessionModel.hasMany(BoardModel);
BoardModel.belongsTo(SessionModel);

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
  _.times(10, () => {
    return ClubModel.create({
      name: casual.city,
    }).then((club) => {
      return club.createSession({
        title: `A session for ${club.name}`,
      });
    }).then((session) => {
        bridge.Session.generateBoards(2).boards.forEach((b) => session.createBoard({
            number: b.number,
            dealer: b.dealer.symbol,
            vulnerability: b.vulnerability,
            deal: bridge.pbn.exportDeal(b.hands, b.dealer),
        }));
    });
  });
});

const Club = db.models.club;
const Session = db.models.session;

const FortuneCookie = {
  getOne() {
    return rp('http://fortunecookieapi.com/v1/cookie')
      .then((res) => JSON.parse(res))
      .then((res) => {
        return res[0].fortune.message;
      });
  },
};


export { Club, Session, FortuneCookie };
