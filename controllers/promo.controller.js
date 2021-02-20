const Promotions = require('../models/promotions.model');

exports.findAll = async (req, res, next) => {
  try {
    const promotions = await Promotions.find({});
    res.status(200).json(promotions);
  } catch (error) {
    next(error);
  }
}

exports.findById = async (req, res, next) => {
  try {
    const promo = await Promotions.findById(req.params.promoId);
    if (promo !== null) {
      res.status(200).json(promo);
    } else {
      res.status(404).end(`Object with id ${req.params.promoId} nof found!`);
    }
  } catch (error) {
    next(error);
  }
}

exports.create = async (req, res, next) => {
  try {
    const createdPromo = await Promotions.create(req.body);
    if (createdPromo !== null) {
      res.location(getCurrentUrl(req) + createdPromo._id).status(201).end();
    } else {
      res.status().end()
    }
  } catch (error) {
    next(error);
  }
}

exports.updateById = async (req, res, next) => {
  try {
    const updatedPromo = await Promotions.findByIdAndUpdate(req.params.promoId, { 
      $set: req.body 
    }, { new: true });
    if (updatedPromo !== null) {
      res.status(200).json(updatedPromo);
    } else {
      res.status(404).end(`Object with id ${req.params.promoId} nof found!`);
    }
  } catch (error) {
    next(error);
  }
}

exports.deleteAll = async (req, res, next) => {
  try {
    await Promotions.remove({});
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

exports.deleteById = async (req, res, next) => {
  try {
    await Promotions.findByIdAndRemove(req.params.promoId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

exports.methodNotSupported = (req, res, next) => {
  res.statusCode = 403;
  res.end(`${req.method} operation not supported on ${req.originalUrl}`);
}

function getCurrentUrl(req) {
	let endpoint = req.originalUrl;
	if (!endpoint.endsWith('/')) {
		endpoint = req.originalUrl + '/'
	}
	return req.protocol + '://' + req.get('host') + endpoint;
}