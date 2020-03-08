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

var USERNAME = "noe.landre";
var PASSWORD = "Minecraft1345";
var TRIMESTER = "";
var ONLY_LOGIN = true;

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

serv.get('/', async function (req, res) {
    var date = new Date;
    var minutes = date.getMinutes();
    var hour = date.getHours();

    console.log('['+ hour +':'+ minutes + '] '+'Body: ' + req.body);
    login.then(function (value) {
        res.send(value);
    })
});

app.listen(PORT, () => console.log(`> Ready on http://localhost:${PORT}`));

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pronote',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

function currentDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;
    return (today);
}

function dateToTime(date) {
    time = new Date(date).getTime() / 1000;
    return (time);
}

function getYearSchool(int) {
    var today = new Date();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (mm < 9) {
        return (yyyy - int);
    } else {
        if (int == 1) { int = 0; } else { int = 1; }
        return (yyyy + int);
    }
}

function dateToMySQL(date) {
    date = date.split("/");
    var newDate = date[2] + "-" + date[1] + "-" + date[0];
    return (newDate);
}

function rmComma(str) {
    var nb = parseFloat(str.toString().replace(",", "."));
    return (nb);
}

const isFirstTime = new Promise(async function (resolve, reject) {
    try {
        username = USERNAME;
        trim = TRIMESTER;
        const result = await pool.query("SELECT * FROM `users` WHERE `username` = ?", [username]);
        if (result[0][0]) {
            trimester = result[0][0].trimester;
            schoolYearStart = dateToTime("09/01/" + result[0][0].year_school_start);
            schoolYearEnd = dateToTime("08/31/" + result[0][0].year_school_end);
            time = dateToTime(currentDate());

            if (time > schoolYearStart && time < schoolYearEnd) {
                if (trimester == trim) {
                    console.log("OK");
                    resolve(true);
                } else {
                    console.log("trimestre pourri");
                    resolve(false);
                }
            } else {
                console.log("schoolYear de merde");
                resolve(false);
            }
        } else {
            console.log("Pas de res");
            resolve(false);
        }
    } catch (error) {
        resolve("MSE");
    }
});


const get_notes = new Promise( async function (resolve, reject) {
    try {
        var username = USERNAME;
        var password = PASSWORD;
        var loginOnly = ONLY_LOGIN;

        var value_to_return;
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = (await browser.pages())[0];

        await page.setDefaultNavigationTimeout(0);

        await page.setRequestInterception(true);

        page.on('request', request => {
            if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet' || request.resourceType() === 'font')
                request.abort();
            else
                request.continue();
        });

        await page.goto('https://lyc-chrestien-de-troyes.monbureaunumerique.fr/');

        await page.evaluate(() => document.querySelector('.fo-connect__link').click());

        const mbn_student_menu = 'button';
        await page.waitForSelector(mbn_student_menu);
        await page.click(mbn_student_menu);

        await page.evaluate(() => document.querySelector('#idp-REIMS-ATS_parent_eleve').click());
        await page.evaluate(() => document.querySelector('#memo_non').click());

        const mbn_submit = '#button-submit';
        await page.waitForSelector(mbn_submit);
        await page.click(mbn_submit);

        await page.waitForNavigation();

        await page.type('#user', username);
        await page.type('#password', password);

        await page.evaluate(() => document.querySelector('#bouton_connexion').click());
        await page.waitForNavigation();
        if (loginOnly == true) {
            if ((await page.url()).indexOf("CTLrrorMsg=Identifiant%20ou%20mot%20de%20passepasse%20incorrect") > -1) {
                resolve(false);
            } else {
                resolve(true);
            }
        }
        if ((await page.url()).indexOf("CTLrrorMsg=Identifiant%20ou%20mot%20de%20passepasse%20incorrect") > -1) {
            resolve("WL");
        }
        await page.waitForNavigation();
        await page.evaluate(() => document.querySelector('[href="/kdecole/activation_service.jsp?service=USER_8"]').click());

        await delay(3000);

        const page2 = (await browser.pages())[1];

        await page2.setRequestInterception(true);

        page2.on('request', request => {
            if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet' || request.resourceType() === 'font')
                request.abort();
            else
                request.continue();
        });

        page2.on('requestfinished', async req => {
            var resText = await req.response().text();
            try {
                let value = JSON.parse(resText);
                if (value.nom === "DernieresNotes") {
                    value_to_return = resText;
                }
            } catch (e) {
                //console.log("not JSON");
            }
        });
        await page2.waitForSelector('[onclick="GInterface.Instances[1]._surToutVoir(10)"]');
        await page2.evaluate(() => document.querySelector('[onclick="GInterface.Instances[1]._surToutVoir(10)"]').click());
        await delay(2000);
        // await page2.evaluate(()=>document.querySelector('.ibe_iconebtn:nth-child(3)').click());
        // await page.evaluate(()=>document.querySelector('[href="https://cas.monbureaunumerique.fr/saml/Logout?service=https%3A%2F%2Flyc-chrestien-de-troyes.monbureaunumerique.fr%2Flogout"]').click());
        await browser.close();
        resolve(value_to_return);
    } catch (error) {
        resolve("Puppeteer Error:" + error);
    }
});

const login = new Promise(async function (resolve, reject) {
    console.log("test");
    ONLY_LOGIN = true;
    get_notes.then(function (isGoodLoginInfo) {
        console.log(isGoodLoginInfo);
        if (isGoodLoginInfo == true) {
            resolve("Success");
        } else {
            resolve("Error");
        }
    });
});

///////////////////////////////////

app.use('/.netlify/functions/server2', serv);

module.exports = serv;
module.exports.handler = serverless(app);