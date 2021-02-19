const express = require('express');
const bodyParser = require('body-parser');

const authenticate = require('../middlewares/authenticate');
const cors = require('../middlewares/cors');

const favoriteController = require('../controllers/favorite.controller');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
	.get(cors.cors, authenticate.verifyUser, 
		(req, res, next) => favoriteController.findFavorites(req, res, next))
	.post(cors.corsWithOptions, authenticate.verifyUser, 
		(req, res, next) => favoriteController.createFavorite(req, res, next))
	.put(cors.corsWithOptions, authenticate.verifyUser, 
		(req, res, next) => favoriteController.methodNotSupported(req, res, next))
	.delete(cors.corsWithOptions, authenticate.verifyUser, 
		(req, res, next) => favoriteController.deleteFavorites(req, res, next));

favoriteRouter.route('/:favoriteDishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, authenticate.verifyUser, 
			(req, res, next) => favoriteController.findFavoriteById(req, res, next))
    .post(cors.corsWithOptions, authenticate.verifyUser, 
			(req, res, next) => favoriteController.createFavoriteById(req, res, next))
    .put(cors.corsWithOptions, authenticate.verifyUser, 
			(req, res, next) => favoriteController.methodNotSupported(req, res, next))
    .delete(cors.corsWithOptions, authenticate.verifyUser, 
			(req, res, next) => favoriteController.deleteFavoriteById(req, res, next));

module.exports = favoriteRouter;