require('dotenv').config();

const path = require('path');
const createError = require('http-errors');
const express = require('express');
const figlet = require('figlet');
const chalk = require('chalk');
const logger = require('morgan');
const cookie = require('cookie-parser');
const body = require('body-parser');
const methodOverride = require('method-override');
const cors = require('cors');
// const session = require('express-session');

const { version } = require('./package');

const port = process.env.PORT || 3010;

const app = express();

app.set('view engine', 'ejs');

if (process.env.NODE_ENV !== 'test') app.use(logger('dev'));

// Configure the App
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(cookie());
app.use(body.json());
app.use(body.urlencoded({ extended: false }));

// app.use(session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: false }));

// Any routes that do not begin with /api/v1 are redirected to the frontend
app.use('/api/v1', require('./routes/apiController'));

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'client/build/index.html')));

app.use((req, res, next) => next(createError(404)));
app.use((err, req, res) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, () => {
  process.env.NODE_ENV !== 'test' && figlet('Spring', (err, data) => {
    console.log(chalk.green(data));
    console.log(chalk.green(`Version ${version}`));
    console.log(chalk.blueBright('----------------------------------'));
    console.log(chalk.blueBright(`| Server Listening on Port ${port}  |`));
    console.log(chalk.blueBright('----------------------------------'));
  });
});

module.exports = app;
