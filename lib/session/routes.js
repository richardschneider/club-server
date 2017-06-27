'use strict';

import { Session, Board, Player, Game, SessionPlayer } from '../../data/connectors';
const express = require('express');
const pbn = require('pbn');
const bridge = require('bridge.js');
const scorer = require('bridge-scorer');

let Duplex = require('stream').Duplex;
function bufferToStream(buffer) {
  let stream = new Duplex();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

function isVulnerable(board, contract) {
    if (board.vulnerability === 'Nil') {
        return false;
    } else if (board.vulnerability === 'All') {
        return true;
    }
    else {
        return board.vulnerability.indexOf(contract.declaror) !== -1;
    }
}

const app = express();

app.post('/session/:id/boards', function(req, res) {
  if (!req.files || !req.files.board) {
    return res.status(400).send('No file was uploaded.');
  }
  let sessionId = parseInt(req.params.id, 10);
  Session.findById(sessionId)
    .then(session => {
      if (!session) {
        return res.status(400).send(`Unknown session "${sessionId}".`);
      }

      var boardNumber;
      let stream = bufferToStream(req.files.board.data)
        .pipe(pbn());
      stream
        .on('data', data => {
          if (data.type === 'tag' && data.name === 'Deal') {
            stream.pause();
            Board
              .findOrBuild({ where: { sessionId: sessionId, number: boardNumber } })
              .then(result => {
                let board = result[0] /*, wasCreated = result[1] */;
                board.deal = data.value;
                board.save().then(() => stream.resume());
              })
            ;
          } else if (data.type === 'tag' && data.name === 'Board') {
            boardNumber = parseInt(data.value, 10);
          }
        })
        .on('error', err => {
            return res.status(400).send(err.message);
        })
        .on('end', () => {
          return res.status(200).send('Uploaded the board(s).');
        });

    })
  ;
});

app.post('/session/:id/pbn', function(req, res) {
  if (!req.files || !req.files.pbn) {
    return res.status(400).send('No file was uploaded.');
  }
  let sessionId = parseInt(req.params.id, 10);
  let model;
  let players = {};
  let pairs = {};

  bridge.Session
    .importPbn(bufferToStream(req.files.pbn.data))
    .catch(err => res.status(400).send(err.message))
    .then(sessionModel => { model = sessionModel; })
    .then(() => Session.findById(sessionId))
    .then(session => {
      if (!session) {
        return res.status(400).send(`Unknown session "${sessionId}".`);
      }

      // Update session info
      if (model.date) {
        session.date = model.date.replace(/\./g , '-');
      }
      return session
        .save()
        .then(() => {
          if (model.games.length > 0) {
            return SessionPlayer.destroy({ where: { sessionId: sessionId } });
          }
        })

      // Create/update the boards
      .then(() => {
        let actions = model.boards.map(b => {
          return Board
            .findOrBuild({ where: { sessionId: sessionId, number: b.number } })
            .then(result => {
              let board = result[0] /*, wasCreated = result[1] */;
              board.deal = b.deal();
              board.vulnerability = b.vulnerability;
              board.dealer = b.dealer.symbol;
              return board
                .save()
                .then(() => { b.orm = board; })
                .then(() => {
                  // Only destroy the games if some games are imported
                  if (model.games.length > 0) {
                    return Game.destroy({ where: { boardId: board.id  } });
                  }
                });
            });
        });
        return Promise.all(actions);
      })

      // Create any unknown players
      // TODO: What about different players with same name.  Maybe scope to club?
      .then(() => {
        // Get a unique list of players
        model.games.forEach(g => {
          Object.keys(g.players).forEach(key => {
            let name = g.players[key];
            players[name] = { name: name };
          });
        });
        // Create player if not present
        let actions = Object.keys(players).map(key => {
          let player = players[key];
          let name = player.name;
          return Player
            .findOrBuild({where: { name: name}})
            .then(result => {
              let p = result[0] /*, wasCreated = result[1] */;
              return p
                .save()
                .then(() => { player.id = p.id; });
            });
        });
        return Promise.all(actions);
      })

      // Create the pairs
      .then(() => {
        let nsTable = 0;
        let ewTable = 0;
        model.games.forEach(g => {
          let name = `NS-${g.players[bridge.seat.north]}-${g.players[bridge.seat.south]}`;
          if (!pairs[name]) {
            pairs[name] = {
              table: ++nsTable,
              players: [
                { seat: 'N', playerId: players[g.players[bridge.seat.north]].id },
                { seat: 'S', playerId: players[g.players[bridge.seat.south]].id }
            ]};
          }
          g.NS = pairs[name].table;

          name = `EW-${g.players[bridge.seat.east]}-${g.players[bridge.seat.west]}`;
          if (!pairs[name]) {
            pairs[name] = {
              table: ++ewTable,
              players: [
                { seat: 'E', playerId: players[g.players[bridge.seat.east]].id },
                { seat: 'W', playerId: players[g.players[bridge.seat.west]].id }
            ]};
          }
          g.EW = pairs[name].table;
        });
        let actions = Object.keys(pairs).map(key => {
          let pair = pairs[key];
          let promise = Promise.resolve();
          pair.players.forEach(player => {
            let sp = {
              seat: player.seat,
              table: pair.table,
              sessionId: sessionId,
              playerId: player.playerId
            };
            promise.then(() => SessionPlayer.create(sp));
          });
          return promise;
        });
        return Promise.all(actions);
      })

      // Create the games
      .then(() => {
        let actions = model.games.map(g => {
          let game = {
            ns: g.NS,
            ew: g.EW,
            level: g.contract.level,
            denomination: g.contract.denomination,
            risk: g.contract.risk,
            made: g.made,
            score: g.score,
            sessionId: g.board.orm.sessionId,
            auction: g.auction.toString(),
            play: g.play().map(c => c.toString().split('').reverse().join('')).join(' '),
          };
          if (g.contract.declaror) {
            game.declaror = g.contract.declaror.symbol;
          }
          if (g.lead()) {
            game.lead = g.lead().toString().split('').reverse().join('');
          }
          if (game.score === undefined) {
            game.score = scorer.contractMade(g.contract, isVulnerable(g.board.orm, g.contract), g.made);
          }
          return g.board.orm.createGame(game);
        });
        return Promise.all(actions);
      })

      // Any errors?
      .catch(err => res.status(500).send(err.message))

      // All done
      .then(() => res.status(200).send('Uploaded the session.'))
    ;
    });
});

module.exports = app;
