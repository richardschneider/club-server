import { Session, Board } from '../../data/connectors';
const express = require('express');
const pbn = require('pbn');

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
  let sessionId = req.params.id;
  Session.findById(sessionId)
    .then(session => {
      if (!session) {
        return res.status(400).send(`Unknown session "${sessionId}".`);
      }

      var boardNumber;
      bufferToStream(req.files.board.data)
        .pipe(pbn())
        .on('data', data => {
          if (data.type === 'tag' && data.name === 'Deal') {
            console.log(`board ${boardNumber} ${data.value}`);
            Board
              .findOrBuild({ where: { sessionId: sessionId, number: boardNumber } })
              .then(result => {
                let board = result[0] /*, wasCreated = result[1] */;
                board.deal = data.value;
                return board;
              })
              .then(board => board.save())
            ;
          } else if (data.type === 'tag' && data.name === 'Board') {
            boardNumber = parseInt(data.value, 10);
          }
        })
        .on('error', err => {
            process.stderr.write(err.message);
            process.exit(1);
        })
        .on('end', () => {
          return res.status(200).send('Uploaded the board(s).');
        });

    })
  ;
});

module.exports = app;