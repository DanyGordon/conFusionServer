const express = require('express');
const bodyParser = require('body-parser');

const authenticate = require('../middlewares/authenticate');
const cors = require('../middlewares/cors');

const promoController = require('../controllers/promo.controller');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => promoController.findAll(req, res, next))
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
        (req, res, next) => promoController.create(req, res, next))
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
        (req, res, next) => promoController.methodNotSupported(req, res, next))
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
        (req, res, next) => promoController.deleteAll(req, res, next));

promoRouter.route('/:promoId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => promoController.findById(req, res, next))
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
        (req, res, next) => promoController.methodNotSupported(req, res, next))
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
        (req, res, next) => promoController.updateById(req, res, next))
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
        (req, res, next) => promoController.deleteById(req, res, next));


module.exports = promoRouter;