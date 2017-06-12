import scorer from 'bridge-scorer';
import resolvers from './resolvers';

const scorers = {
  matchpoints (games) {
    scorer.matchpoints(games);
    let scoredGames = games.map(g => {
        let game = g.game;
        game.matchpointsNS = g.matchpointsNS.value;
        game.matchpointsPercentageNS = g.matchpointsNS.percentage;
        game.matchpointsEW = g.matchpointsEW.value;
        game.matchpointsPercentageEW = g.matchpointsEW.percentage;
        return game.save();
    });
    return Promise.all(scoredGames);
  },
  matchpointsACBL (games) {
    scorer.matchpointsACBL(games);
    let scoredGames = games.map(g => {
        let game = g.game;
        game.matchpointsNS = g.matchpointsNS.value;
        game.matchpointsPercentageNS = g.matchpointsNS.percentage;
        game.matchpointsEW = g.matchpointsEW.value;
        game.matchpointsPercentageEW = g.matchpointsEW.percentage;
        return game.save();
    });
    return Promise.all(scoredGames);
  },
};

function scoreBoard (board, algorithm) {
  return board
    .getGames()
    .then(games => {
        let scoredGames = games.map(g => {
            return {
                game: g,
                score: g.score,
                contract: resolvers.Game.contract(g)
            };
        });
        return scorers[algorithm](scoredGames);
    });
}

function score(session, algorithm) {
  if (!scorer[algorithm]) {
      throw new Error(`Scoring ${algorithm} is not defined`);
  }
  if (!scorers[algorithm]) {
      throw new Error(`Scoring ${algorithm} is NYI`);
  }

  return session
    .getBoards()
    .then(boards => Promise.all(boards.map(board => scoreBoard(board, algorithm))))
    .then(() => session);
}

export default score;
