var passport = require('passport');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var User = require('./models/user');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var FacebookTokenStrategy = require('passport-facebook-token');

var config = require('../config/config');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
  return jwt.sign(user, config.secretKey,
    {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
  async (jwt_payload, done) => {
    try {
      const user = await User.findOne({_id: jwt_payload._id});
      user ? done(null, user) : done(null, false);
    } catch (err) {
      return done(err, false);
    }
  })
);

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = function (req, res, next) {
  if (req.user.admin) {
    next();
  } else {
    res.status(403).end('You are not authorized to perfom this operation!');
  }
  return;
}

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
  clientID: config.facebook.clientID,
  clientSecret: config.facebook.clientSecret
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await User.findOne({ facebookId: profile.id });
    if (user) {
      return done(null, user);
    } else {
      user = new User({ username: profile.displayName });
      user.facebookId = profile.id;
      user.firstname = profile.name.givenName;
      user.lastname = profile.name.fammilyName;
      user.save((err, user) => {
        err ? done(err, false) : done(null, user);
      });
    }
  } catch (err) {
    return done(err, false);
  } 
}));