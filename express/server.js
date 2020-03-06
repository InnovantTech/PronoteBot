'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
var mysql = require('mysql2/promise');
var sanitizer = require('sanitizer');
var aes256 = require('./aes256');

const serv = express.Router();
serv.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Hello from Express.js!</h1>');
  res.end();
});

serv.post('/',  async function(req, res) {
	body = req.body;
	var key1 = '%%%InnovanTech%%%hfuhfzeuhehufzeifHUZIUIUAZEGHDRuazsjdczhfzejifjdibhufihezioxdjfusbutfdzae1454rt56aert4aert4aez4rta6traeaertaer%%%InnovanTech%%%';
  var key2 = '%%%InnovanTech%%%DZUYGDZYBADJAZZhuiaheajpodkadygufhqsdofjqsdiçfuhjeziu56894518798456489451527845641897edrfjuezfutyzadfbshjfvuyq%%%InnovanTech%%%';
  if(!body.user || !body.pass){
    res.send('Error');
    return;
  }

  var username = sanitizer.sanitize(aes256.decrypt(key1, body.user));
  var password = sanitizer.sanitize(aes256.decrypt(key2, body.pass));

  if(body.loginOnly){
    var rtn = await login(username, password);
    console.log(rtn);
    response.send(rtn);
    return false;
  }else{
    var rtn = await app(username, password);
    console.log(rtn);
    response.send(rtn);
    return true;
  }
});



app.use(bodyParser.json());
app.use('/.netlify/functions/server', serv);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);
