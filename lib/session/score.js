import scorer from 'bridge-scorer';
import resolvers from '../../data/resolvers';
import { Board, Game, SessionPairResult } from '../../data/connectors';

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
  crossImps (games) {
    scorer.crossImps(games);
    let scoredGames = games.map(g => {
        let game = g.game;
        game.impsNS = g.impsNS.value;
        game.impsEW = g.impsEW.value;
        return game.save();
    });
    return Promise.all(scoredGames);
  },
  butler (games) {
    scorer.butler(games);
    let scoredGames = games.map(g => {
        let game = g.game;
        game.impsNS = g.impsNS.value;
        game.impsEW = g.impsEW.value;
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

function rankPairs(session) {
  return Promise.resolve()
    // Get all games for the session
    .then(() => Game.findAll({include: [{ model: Board, where: { sessionId: session.id } }]}))

    // Rank the pairs
    .then(games => {
      let pairs = {};

      // Get the total for each pair
      games.forEach(game => {
        let nsId = `${session.id}-NS-${game.ns}`;
        let ns = pairs[nsId] || { total: 0, played: 0, direction: 'NS' };
        pairs[nsId] = ns;
        ns.played += 1;
        ns.total += game.matchpointsPercentageNS;

        let ewId = `${session.id}-EW-${game.ew}`;
        let ew = pairs[ewId] || { total: 0, played: 0, direction: 'EW' };
        pairs[ewId] = ew;
        ew.played += 1;
        ew.total += game.matchpointsPercentageEW;
      });

      // Get score (total / games played) for each pair
      for (var pairname in pairs) {
        let pair = pairs[pairname];
        pair.score = pair.total / pair.played;
      }

      // Rank NS pairs
      let nsPairs = Object.getOwnPropertyNames(pairs)
        .map(val => pairs[val])
        .filter(pair => pair.direction === 'NS');
      scorer.rank(nsPairs);

      // Rank EW pairs
      let ewPairs = Object.getOwnPropertyNames(pairs)
        .map(val => pairs[val])
        .filter(pair => pair.direction === 'EW');
      scorer.rank(ewPairs);

      // All pairs as an array
      return Object.getOwnPropertyNames(pairs)
        .map(val => {
          let pair = pairs[val];
          pair.id = val;
          let rank = pair.rank;
          pair.tied = rank.endsWith('=');
          pair.rank = parseFloat(rank);
          return pair;
      });
    })

    // Update pair ranking
    .then(pairs => {
      return Promise.all(pairs.map(pair => {
        return SessionPairResult.upsert({
          id: pair.id,
          rank: pair.rank,
          tied: pair.tied,
          score: pair.score,
          scale: pair.scale
        });
      }));
    })
  ;
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
    .then(() => rankPairs(session))
    .then(() => session);
}

export default score;
