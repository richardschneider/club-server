import { Club, FortuneCookie } from './connectors';

const resolvers = {
  Query: {
    clubs() {
      return Club.findAll({});
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
  },

  Board: {
    session(board) {
      return board.getSession();
    },
  },

//    views(post) {
//      return View.findOne({ postId: post.id }).then((view) => view.views);
//    },
};

export default resolvers;
