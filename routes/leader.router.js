const express = require('express');
const bodyParser = require('body-parser');

let authenticate = require('../middlewares/authenticate');
let cors = require('../middlewares/cors');

const leaderController = require('../controllers/leader.controller')

const leadersRouter = express.Router();

leadersRouter.use(bodyParser.json());

leadersRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => leaderController.findAll(req, res, next))
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
        (req, res, next) => leaderController.create(req, res, next))
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
        (req, res, next) => leaderController.methodNotSupported(req, res, next))
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
        (req, res, next) => leaderController.deleteAll(req, res, next));

leadersRouter.route('/:leaderId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => leaderController.findById(req, res, next))
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
        (req, res, next) => leaderController.methodNotSupported(req, res, next))
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
        (req, res, next) => leaderController.updateById(req, res, next))
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
        (req, res, next) => leaderController.deleteById(req, res, next));


module.exports = leadersRouter;