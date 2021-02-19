const express = require('express');
const bodyParser = require('body-parser');

const authenticate = require('../middlewares/authenticate');
const cors = require('../middlewares/cors');

const dishController = require('../controllers/dish.controller');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, (req, res, next) => dishController.findAll(req, res, next))
  .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
    (req, res, next) => dishController.create(req, res, next))
  .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
    (req, res, next) => dishController.methodNotSupported(req, res, next))
  .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
    (req, res, next) => dishController.deleteAll(req, res, next));

dishRouter.route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, (req,res,next) => dishController.findById(req, res, next))
  .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
    (req, res, next) => dishController.methodNotSupported(req, res, next))
  .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
    (req, res, next) => dishController.updateById(req, res, next))
  .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
    (req, res, next) => dishController.deleteById(req, res, next));

dishRouter.route('/:dishId/comments')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, (req,res,next) => dishController.getAllComents(req, res, next))
  .post(cors.corsWithOptions, authenticate.verifyUser, 
    (req, res, next) => dishController.addComentToDish(req, res, next))
  .put(cors.corsWithOptions, authenticate.verifyUser, 
    (req, res, next) => dishController.methodNotSupported(req, res, next))
  .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
    (req, res, next) => dishController.deleteAllComentsOfDish(req, res, next));
  
dishRouter.route('/:dishId/comments/:commentId')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, (req,res,next) => dishController.getComentById(req, res, next))
  .post(cors.corsWithOptions, authenticate.verifyUser, 
    (req, res, next) => dishController.methodNotSupported(req, res, next))
  .put(cors.corsWithOptions, authenticate.verifyUser, 
    (req, res, next) => dishController.updateComentById(req, res, next))
  .delete(cors.corsWithOptions, authenticate.verifyUser, 
    (req, res, next) => dishController.deleteComentById(req, res, next));

module.exports = dishRouter;