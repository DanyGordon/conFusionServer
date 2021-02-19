const Favorite = require('../models/favorites.model');
const Dishes = require('../models/dishes.model');

exports.findFavorites = async (req, res, next) => {
  try {
    const favorite = await Favorite.findOne({ user: req.user._id })
      .populate('user')
      .populate('dishes');
    if (favorite !== null) {
      res.status(200).json(favorite);
    } else {
      res.status(404).json({ status: 'You have no favorites!' });
    }
  } catch (error) {
    next(error);
  }
}

exports.findFavoriteById = async (req, res, next) => {
  try {
    const favorite = await Favorite.findOne({ user: req.user._id })
      .populate('user')
      .populate('dishes');
    if (!favorite) {
      res.status(404).end(`You have no favorites!`);
    } else {
      const isDish = favorite.dishes.some(dish => dish._id == req.params.favoriteDishId);
      isDish 
        ? res.status(200).json(favorite)
        : Dishes.findById(req.params.favoriteDishId, (err, dish) => {
          err 
            ? res.status(404).end(`Dish with id ${req.params.favoriteDishId} non exist`) 
            : res.status(200).end(`${dish.name} is not in your favorites!`);
        });
    }
  } catch (error) {
    next(error);
  }
}

exports.createFavorite = async (req, res, next) => {
  try {
    const favorite = await Favorite.findOne({ user: req.user._id });
    if (!favorite) {
      const createdFavorite = await Favorite.create({ user: req.user._id, dishes: req.body });
      res.location(getCurrentUrl(req) + createdFavorite._id).status(201).end();
    } else {
      for (let dish in req.body) {
        if (favorite.dishes.indexOf(dish._id) < 0) {
          favorite.dishes.push(dish);
        }
      }
      await favorite.save();
      res.location(getCurrentUrl(req) + favorite._id).status(201).end();
    }
  } catch (error) {
    next(error);
  }
}

exports.createFavoriteById = async (req, res, next) => {
  try {
    const favorite = await Favorite.findOne({ user: req.user._id })
      .populate('user')
      .populate('dishes');
    if (!favorite) {
      const createdFavorite = await Favorite.create({ user: req.user._id, dishes: [ req.params.favoriteDishId ] });
      res.location(getCurrentUrl(req) + createdFavorite._id).status(201).end();
    } else {
      const isDish = favorite.dishes.some(dish => dish._id == req.params.favoriteDishId);
      if (!isDish) {
        await (favorite.dishes.push({ _id: req.params.favoriteDishId })).save();
        res.location(getCurrentUrl(req)).status(201).end();
      } else {
        Dishes.findById(req.params.favoriteDishId, (err, dish) => {
          res.status(200).json({ status: `${dish.name} is already a favorite!` });
        });
      }
    }
  } catch(error) {
    next(error);
  }
}

exports.deleteFavorites = async (req, res, next) => {
  try {
    await Favorite.remove({});
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

exports.deleteFavoriteById = async (req, res, next) => {
  try {
    const favorite = await Favorite.findOne({ user: req.user._id });
    if (!favorite) {
      res.status(404).end(`You have no favorites!`);
    } else {
      const isDish = favorite.dishes.some(dish => dish._id == req.params.favoriteDishId);
      if (isDish) {
        favorite.dishes.pull(req.params.favoriteDishId)
        await favorite.save();
        res.status(204).end();
      } else {
        const dish = await Dishes.findById(req.params.favoriteDishId);
        res.status(200).end(`${dish.name} cannot be deleted from your favorites because it is not a favorite.`)
      }
    }
  } catch (error) {
    next(error);
  }
}

exports.methodNotSupported = (req, res, next) => {
  res.statusCode = 403;
  res.end(`${req.method} operation not supported on ${req.url}`);
}

function getCurrentUrl(req) {
	let endpoint = req.originalUrl;
	if (!endpoint.endsWith('/')) {
		endpoint = req.originalUrl + '/'
	}
	return req.protocol + '://' + req.get('host') + endpoint;
}