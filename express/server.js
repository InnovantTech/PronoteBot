'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

const serv = express.Router();
serv.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Hello from Express.js!</h1>');
  res.end();
});
serv.get('/another', (req, res) => res.json({ route: req.originalUrl }));
serv.post('/', (req, res) => res.json({ postBody: req.body }));



app.use(bodyParser.json());
app.use('/.netlify/functions/server', serv);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);
