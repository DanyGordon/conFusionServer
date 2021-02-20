const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
/* var session = require('express-session');
var FileStore = require('session-file-store')(session); */
const mongoose = require('mongoose');
const passport = require('passport');
const config = require('./config/config');

const url = config.mongoUrl;
const connect = mongoose.connect(url);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users.router');
const dishRouter = require('./routes/dish.router');
const promoRouter = require('./routes/promo.router');
const leadersRouter = require('./routes/leader.router');
const uploadRouter = require('./routes/upload.router');
const favoriteRouter = require('./routes/favorite.router');

connect.then((db) => {
  console.log("Connected correctly to server");
}, (err) => { console.log(err); });

const app = express();

// Secure traffic only
/* app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
}); */

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use(cookieParser('12345-67890-09876-54321'));

/*app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));

app.use(auth);*/
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);

/*function auth (req, res, next) {
  console.log(req.user);

  if (!req.user) {
    var err = new Error('You are not authenticated!');
    err.status = 403;
    next(err);
  }
  else {
        next();
  }
}*/

app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leadersRouter);
app.use('/favorites', favoriteRouter);
app.use('/imageUpload', uploadRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(8080);

module.exports = app;
