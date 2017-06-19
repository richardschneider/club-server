import { Session, Board } from '../../data/connectors';
const express = require('express');
const pbn = require('pbn');
const bridge = require('bridge.js');

let Duplex = require('stream').Duplex;
function bufferToStream(buffer) {
  let stream = new Duplex();
  stream.push(buffer);
  stream.push(null);
  return stream;
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
      session.save()

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
                .then(() => board.setGames([]));
            });
        });
        return Promise.all(actions);
      })

      // Create/update the games
      .then(() => {
        let actions = model.games.map(g => {
          let game = {
            ns: 1,
            ew: 1,
            level: g.contract.level,
            denomination: g.contract.denomination,
            risk: g.contract.risk,
            made: g.made
          };
          if (g.contract.declaror) {
            game.declaror = g.contract.declaror.symbol;
          }
          if (g.lead()) {
            game.lead = g.lead().toString().split('').reverse().join('');
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
