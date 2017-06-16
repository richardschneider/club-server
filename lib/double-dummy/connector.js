import rp from 'request-promise';

module.exports = {

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
