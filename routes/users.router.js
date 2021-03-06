const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const authenticate = require('../middlewares/authenticate');
const cors = require('../middlewares/cors');

const usersController = require('../controllers/users.controller');

const router = express.Router();

router.use(bodyParser.json());

router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); } )

router.route('/')
  .get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
    (req, res, next) => usersController.findAll(req, res, next));

router.post('/signup', cors.corsWithOptions, 
  (req, res, next) => usersController.register(req, res, next));

router.post('/login', cors.corsWithOptions, 
  (req, res, next) => usersController.login(req, res, next));

router.get('/logout', cors.corsWithOptions, 
  (req, res, next) => usersController.logout(req, res, next));

router.get('facebook/token', cors.corsWithOptions, passport.authenticate('facebook-token'), 
  (req, res, next) => usersController.facebookTokenAuth(req, res, next));

router.get('/checkJWTtoken', cors.corsWithOptions, 
  (req, res, next) => usersController.checkingJWT(req, res, next));

module.exports = router;
