'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Thread = mongoose.model('Thread'),
  Post = mongoose.model('Post'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an thread
 */
exports.create = function (req, res) {
  var post = new Post(req.body);
  var thread = new Thread(req.body);
  var user = req.user;
  
  post.name = user ? (req.body.name ? post.name : user.displayName) : post.name;
  post.isUser = !!user;

  var TrySaveThread = function(reqThread, savedPost, res){
    reqThread.number = savedPost.number;
    reqThread.save(function (err) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        //res.json(reqThread);
        res.json(savedPost);
      }
    });    
  }

  var TrySavePost = function(reqPost, res){
    reqPost.save(function(err, savedPost){
      if(err && err.code === 11000){//Repited index (Post number)
        reqPost.number++;
        TrySave(reqPost, res);
      }else if(err){
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }else {
        // console.log(savedPost);
        TrySaveThread(thread, savedPost, res);
      }
    });
  }

  TrySavePost(post, res);


  // 
  // thread.user = req.user;


};

/**
 * Show the current thread
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var thread = req.thread ? req.thread.toJSON() : {};

  // Add a custom field to the thread, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the thread model.
  thread.isCurrentUserOwner = !!(req.user && thread.user && thread.user._id.toString() === req.user._id.toString());

  res.json(thread);
};

/**
 * Update an thread
 */
exports.update = function (req, res) {
  var thread = req.thread;

  thread.title = req.body.title;
  thread.content = req.body.content;

  thread.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(thread);
    }
  });
};

/**
 * Delete an thread
 */
exports.delete = function (req, res) {
  var thread = req.thread;

  thread.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(thread);
    }
  });
};

/**
 * List of threads
 */
exports.list = function (req, res) {
 // Thread.find().sort('-created').populate('user', 'displayName').exec(function (err, threads) {
  Thread.aggregate([{ $lookup:
     {
       from: 'posts',
       localField: 'number',
       foreignField: 'threadParent',
       as: 'post'
     }}])
  .sort('-created').exec(function (err, threads) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(threads);
    }
  });
};

/**
 * thread middleware
 */
exports.threadByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Thread is invalid'
    });
  }

  Thread.findById(id).populate('user', 'displayName').exec(function (err, thread) {
    if (err) {
      return next(err);
    } else if (!thread) {
      return res.status(404).send({
        message: 'No thread with that identifier has been found'
      });
    }
    req.thread = thread;
    next();
  });
};
