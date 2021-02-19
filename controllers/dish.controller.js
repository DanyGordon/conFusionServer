const Dishes = require('../models/dishes.model');

exports.findAll = async (req, res, next) => {
  try {
    const dishes = await Dishes.find({}).populate('comments.author');
    res.status(200).json(dishes);
  } catch (error) {
    next(error);
  }
}

exports.findById = async (req, res, next) => {
  try {
    const dish = await Dishes.findById(req.params.dishId).populate('comments.author');
    if (dish !== null) {
      res.status(200).json(dish);
    } else {
      res.status(404).end(`Object with id ${req.params.dishId} nof found!`);
    }
  } catch (error) {
    next(error);
  }
}

exports.create = async (req, res, next) => {
  try {
    const createdDish = await Dishes.create(req.body);
    if (createdDish !== null) {
      res.location(getCurrentUrl(req) + createdDish._id).status(201).end();
    } else {
      res.status().end()
    }
  } catch (error) {
    next(error);
  }
}

exports.updateById = async (req, res, next) => {
  try {
    const updatedDish = await  Dishes.findByIdAndUpdate(req.params.dishId, { 
      $set: req.body 
    }, { new: true });
    if (updatedDish !== null) {
      res.status(200).json(updatedDish);
    } else {
      res.status(404).end(`Object with id ${req.params.dishId} nof found!`);
    }
  } catch (error) {
    next(error);
  }
}

exports.deleteAll = async (req, res, next) => {
  try {
    await Dishes.remove({});
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

exports.deleteById = async (req, res, next) => {
  try {
    await Dishes.findByIdAndRemove(req.params.dishId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

exports.getAllComents = async (req, res, next) => {
  try {
    const dish = await Dishes.findById(req.params.dishId).populate('comments.author');
    if (dish) {
      res.status(200).json(dish.comments);
    } else {
      const error = new Error('Dish ' + req.params.dishId + ' not found');
      error.status = 404;
      return next(error);
    }
  } catch (error) {
    next(error);
  }
}

exports.getComentById = async (req, res, next) => {
  try {
    const dish = await Dishes.findById(req.params.dishId).populate('comments.author');
    if (dish) {
      if (dish.comments.id(req.params.commentId)) {
        res.status(200).json(dish.comments.id(req.params.commentId));
      } else {
        const error = new Error('Comment ' + req.params.commentId + ' not found');
        error.status = 404;
        return next(error); 
      }
    } else {
      const error = new Error('Dish ' + req.params.dishId + ' not found');
      error.status = 404;
      return next(error);
    }
  } catch (error) {
    next(error);
  }
}

exports.addComentToDish = async (req, res, next) => {
  try {
    const dish = await Dishes.findById(req.params.dishId).populate('comments.author');
    if (dish) {
      req.body.author = req.user._id;
      dish.comments.push(req.body)
      await dish.save();
      res.location(getCurrentUrl(req)).status(201).end();
    } else {
      const error = new Error('Dish ' + req.params.dishId + ' not found');
      error.status = 404;
      return next(error);
    }
  } catch (error) {
    next(error);
  }
}

exports.updateComentById = async (req, res, next) => {
  try {
    const dish = await Dishes.findById(req.params.dishId);
    if (dish && dish.comments.id(req.params.commentId)) {
      if (req.user._id == dish.comments.id(req.params.commentId).author._id) {
        if (req.body.rating) {
          dish.comments.id(req.params.commentId).rating = req.body.rating;
        }
        if (req.body.comment) {
          dish.comments.id(req.params.commentId).comment = req.body.comment;                
        }
        await dish.save().populate('comments.author');
        res.status(200).json(dish);
      } else {
        const error = new Error('You are not authorized to perfom this operation!');
        error.status = 404;
        return next(error);
      }
    } else if (!dish) {
      const error = new Error('Dish ' + req.params.dishId + ' not found');
      error.status = 404;
      return next(error);
    } else {
      const error = new Error('Comment ' + req.params.commentId + ' not found');
      error.status = 404;
      return next(error);  
    }
  } catch (error) {
    next(error);
  }
}

exports.deleteAllComentsOfDish = async (req, res, next) => {
  try {
    const dish = await Dishes.findById(req.params.dishId);
    if (dish) {
      for (let i = 0; i < dish.comments.length; i++) {
        dish.comments.id(dish.comments[i]._id).remove();
      }
      await dish.save();
      res.status(204).end();
    } else {
      const error = new Error('Dish ' + req.params.dishId + ' not found');
      error.status = 404;
      return next(error);
    }
  } catch (error) {
    next(error);
  } 
}

exports.deleteComentById = async (req, res, next) => {
  try {
    const dish = await Dishes.findById(req.params.dishId);
    if (dish && dish.comments.id(req.params.commentId)) {
      if (req.user._id == dish.comments.id(req.params.commentId).author._id) {
        dish.comments.id(req.params.commentId).remove();
        await dish.save();
        res.status(204).end();
      } else {
        const error = new Error('You are not authorized to perfom this operation!');
        error.status = 404;
        return next(error);
      }
    } else if (!dish) {
      const error = new Error('Dish ' + req.params.dishId + ' not found');
      error.status = 404;
      return next(error);
    } else {
      const error = new Error('Comment ' + req.params.commentId + ' not found');
      error.status = 404;
      return next(error);  
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