'use strict';
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
var mysql = require('mysql2/promise');
var sanitizer = require('sanitizer');
var aes256 = require('./../aes256');
const PORT = 5555;
const serv = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

serv.get('/', async function (req, res) {
    promise.then(function(value) {
        res.send(value);
    })
});

app.listen(PORT, () => console.log(`> Ready on http://localhost:${PORT}`));

const promise = new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve('foo');
    }, 3000);
});

app.use('/.netlify/functions/server2', serv);

module.exports = serv;
module.exports.handler = serverless(app);