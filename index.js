require('dotenv').config();

const path = require('path');
const createError = require('http-errors');
const express = require('express');
const figlet = require('figlet');
const chalk = require('chalk');
const logger = require('morgan');
const cookie = require('cookie-parser');
const body = require('body-parser');
const session = require('express-session');

const { version } = require('./package');

const port = process.env.PORT || 3010;

const app = express();

app.set('view engine', 'ejs');

if(!process.env.TEST) app.use(logger('dev'));

// Configure the App
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(cookie());
app.use(body.json());
app.use(body.urlencoded({ extended: false }));
// app.use(session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: false }));

app.use('/api/v1', require('./routes/apiController'));
app.get('/', (req, res) => res.json({ version, message: 'Inventory Management API' }));

app.use((req, res, next) => next(createError(404)));
app.use((err, req, res) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

app.listen(port, () => {
   !process.env.TEST && figlet('Spring', (err, data) => {
       console.log(chalk.green(data));
       console.log(chalk.green(`Version ${version}`));
       console.log(chalk.blueBright('----------------------------------'));
       console.log(chalk.blueBright(`| Server Listening on Port ${port}  |`));
       console.log(chalk.blueBright('----------------------------------'));
   });
});