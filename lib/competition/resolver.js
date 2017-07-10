// graphql resolver for a competition

module.exports = {

   club(competition) {
      return competition.getClub();
    },

    sessions(competition) {
      return competition.getSessions();
    },

};
