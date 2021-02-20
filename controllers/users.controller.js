const User = require('../models/user.model');
const passport = require('passport');
const authenticate = require('../middlewares/authenticate');

exports.findAll = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

exports.register = async (req, res, next) => {
  try {
    const user = await User.register(new User({username: req.body.username}), req.body.password);
    user.firstname = req.body.firstname;
    user.lastname = req.body.lastname;
    await user.save();
    passport.authenticate('local')(req, res, () => {
      res.status(200).json({success: true, status: 'Registration Successful!'});
    });
  } catch (error) {
    next(error);
  }
}

exports.login = async (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if(err) {
      return next(err);
    } 
    if (!user) {
      return res.status(401).json({
        success: false, 
        status: 'Login Unsuccessful!', 
        err: info
      });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(401).json({
          success: false, 
          status: 'Login Unsuccessful!', 
          err: 'Could not log in user!'
        });          
      }
      const token = authenticate.getToken({_id: req.user._id});
      res.status(200).json({success: true, status: 'Login Successful!', token: token});
    }); 
  }) (req, res, next);
}

exports.logout = async (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    const err = new Error('You are not logged in!');
    err.status = 403;
    return next(err);
  }
}

exports.facebookTokenAuth = async (req, res, next) => {
  if (req.user) {
    const token = authenticate.getToken({_id: req.user._id});
    res.status(200).json({success: true, token: token, status: 'You are successfully logged in!'});
  }
}

exports.checkingJWT = async (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    err ? next(err) 
      : user ? res.status(200).json({status: 'JWT valid!', success: true, user: user})
        : res.status(401).json({status: 'JWT invalid!', success: false, err: info})
  }) (req, res);
}