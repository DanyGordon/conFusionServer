const Leaders = require('../models/leaders.model');

exports.findAll = async (req, res, next) => {
  try {
    const leaders = await Leaders.find({}).populate('comments.author');
    res.status(200).json(leaders);
  } catch (error) {
    next(error);
  }
}

exports.findById = async (req, res, next) => {
  try {
    const leader = await Leaders.findById(req.params.leaderId).populate('comments.author');
    if (leader !== null) {
      res.status(200).json(leader);
    } else {
      res.status(404).end(`Object with id ${req.params.leaderId} nof found!`);
    }
  } catch (error) {
    next(error);
  }
}

exports.create = async (req, res, next) => {
  try {
    const createdLeader = await Leaders.create(req.body);
    if (createdLeader !== null) {
      res.location(getCurrentUrl(req) + createdLeader._id).status(201).end();
    } else {
      res.status().end()
    }
  } catch (error) {
    next(error);
  }
}

exports.updateById = async (req, res, next) => {
  try {
    const updatedLeader = await Leaders.findByIdAndUpdate(req.params.leaderId, { 
      $set: req.body 
    }, { new: true });
    if (updatedLeader !== null) {
      res.status(200).json(updatedLeader);
    } else {
      res.status(404).end(`Object with id ${req.params.leaderId} nof found!`);
    }
  } catch (error) {
    next(error);
  }
}

exports.deleteAll = async (req, res, next) => {
  try {
    await Leaders.remove({});
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

exports.deleteById = async (req, res, next) => {
  try {
    await Leaders.findByIdAndRemove(req.params.leader7Id);
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