import { Club, Address } from '../../data/connectors';
import vcard from './vcard';
const filenamify = require('filenamify');
const express = require('express');
const app = express();

app.get('/club/:id/vcard', function(req, res) {
  let clubId = parseInt(req.params.id, 10);
  Club
    .findById(clubId, { include: [Address] })
    .then(club => {
      if (!club) {
        return res.status(400).send(`Unknown club "${clubId}".`);
      }
      let card = vcard(club);
      let fname = filenamify(`${club.name}.vcf`);
      res.set('Content-Type', `text/vcard; name="${fname}"`);
      res.set('Content-Disposition', `inline; filename="${fname}"`);
      return res.send(card.getFormattedString());
    })
  ;
});

module.exports = app;
