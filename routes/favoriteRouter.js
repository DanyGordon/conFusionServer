const express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');

const Favorite = require('../models/favorites');
const Dishes = require('../models/dishes');
var authenticate = require('../authenticate');
let cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
        .then((favorite) => {
            if (!favorite) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.json({ status: 'You have no favorites!' })
            } else {
                Favorite.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err))
                .catch((err) => next(err));
            }
        })
        .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
        .then((favorite) => {
            if (!favorite) {
                Favorite.create({ user: req.user._id, dishes: req.body }, (err, doc) => {
                    if (err) {
                        return next(err);
                    } else {
                        console.log('Document inserted');
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json(doc);
                    }
                })
            } else {
                for (let dish in req.body) {
                    if (favorite.dishes.indexOf(dish._id) < 0) {
                        favorite.dishes.push(dish);
                    }
                }
                favorite.save()
                .then((favorite) => {
                    Favorite.findById(favorite._id)
					.then((favorite) => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
					    res.json(favorite);
					});
                })
                .catch(err => next(err));
            }
        })
        .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.remove({})
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
    });

favoriteRouter.route('/:favoriteDishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
		.then((favorite) => {
			if (!favorite) {
				res.statusCode = 404;
			    res.setHeader('Content-Type', 'application/json');
				return res.json(`You have no favorites!`);
			} else {
				if (favorite.dishes.indexOf(req.params.favoriteDishId) < 0) {
                    Dishes.findById(req.params.favoriteDishId)
                    .then((dish) => {
					    res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						return res.json(`${dish.name} is not in your favorites!`);
					});
				} else {
					Favorite.findById(favorite._id).populate('user').populate('dishes').then((favorite) => {
					    res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						return res.json(favorite);
					});
				}
		    }
	    }).catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
		.then((favorite) => {
		    if (!favorite) {
				Favorite.create({ user: req.user._id, dishes: [ req.params.favoriteDishId ] }, (err, doc) => {
				    if (err) {
                        console.log(err);
						return next(err);
					} else {
						console.log('Document inserted');
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						return res.json(doc);
					}
				});
			} else if (favorite.dishes.indexOf(req.params.favoriteDishId) > -1) {
				Dishes.findById(req.params.favoriteDishId)
				.then((dish) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(`${dish.name} is already a favorite!`);
				}, (err) => {next(err); console.log(err); })
				.catch((err) => {
                    console.log(err);
					return next(err);
				});
			} else if (favorite.dishes.indexOf(req.params.favoriteDishId) < 0) {
				req.body.user = req.user._id;
				favorite.dishes.push({ _id: req.params.favoriteDishId });
				favorite.save()
			    .then((favorite) => {
					Favorite.findById(favorite._id).populate('user').populate('dishes').then((favorite) => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						return res.json(favorite);
					});
				}).catch((err) => {
					return next(err);
				});
			}
		}).catch((err) => {
			return next(err);
		});
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites/:favoriteDishId');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
		.then((favorite) => {
			if (!favorite) {
			    res.statusCode = 404;
				res.setHeader('Content-Type', 'application/json');
				return res.json(`You have no favorites to delete!`);
			} else if (favorite.dishes.indexOf(req.params.favoriteDishId) < 0) {
				Dishes.findById(req.params.favoriteDishId)
				.then((dish) => {
				    res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					return res.json(`${dish.name} cannot be deleted from your favorites because it is not a favorite.`);
				}, (err) => next(err))
				.catch((err) => {
				    return next(err);
				});
			} else if (favorite.dishes.indexOf(req.params.favoriteDishId) > -1) {
				favorite.dishes.pull(req.params.favoriteDishId);
				favorite.save();
				Dishes.findById(req.params.favoriteDishId)
				.then((dish) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(`${dish.name} was deleted from  your favorites.`);
				}, (err) => next(err))
				.catch((err) => {
				    return next(err);
				});
			}
		}).catch((err) => {
			return next(err);
		});
    });

module.exports = favoriteRouter;