'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post'),
  fs = require('fs'),
  path = require('path'),
  multer = require('multer'),
  multerS3 = require('multer-s3'),
  aws = require('aws-sdk'),
  amazonS3URI = require('amazon-s3-uri'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var useS3Storage = config.uploads.storage === 's3' && config.aws.s3;
var s3;

if (useS3Storage) {
  aws.config.update({
    accessKeyId: config.aws.s3.accessKeyId,
    secretAccessKey: config.aws.s3.secretAccessKey
  });

  s3 = new aws.S3();
}

/**
 * Create a post
 */
exports.create = function (req, res) {
  var idList = req.body.IDList;
  var post = new Post(req.body);
  var user = req.user;

  post.name = user ? (req.body.name ? post.name : user.displayName) : post.name;
  post.isUser = !!user;

  var TrySave = function(reqPost, res){
    reqPost.save(function(err){
      if(err && err.code === 11000){//Repited index (Post number)
        reqPost.number++;
        TrySave(reqPost, res);
      }else if(err){
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }else {
        idList.forEach(function (elem){
          Post.findById(elem).exec(function (err, postToUpdate) {
            if (err) {
              //Do nothing
            } else if (postToUpdate) {
              postToUpdate.replies.set(postToUpdate.replies.length , reqPost.number);
              postToUpdate.save(function (err) {
                if (err) {
                } else {
                }
              });
            }
          });
        });
        res.json(reqPost);
      }
    });
  }

  TrySave(post, res);
};


/**
 * Upload file
 */
exports.uploadFile = function (req, res) {
  
  var user = req.user;
  var existingImageUrl;
  var multerConfig;


  if (useS3Storage) {
    multerConfig = {
      storage: multerS3({
        s3: s3,
        bucket: config.aws.s3.bucket,
        acl: 'public-read'
      })
    };
  } else {
    multerConfig = config.uploads.postFile.image;
  }

  // Filtering to upload only images
  multerConfig.fileFilter = require(path.resolve('./config/lib/multer')).imageFileFilter;

  var upload = multer(multerConfig).single('newPostFile');

    uploadImage()
      // .then(updateUser)
      // .then(deleteOldImage)
      // .then(login)
      .then(function () {
        var objFile = {
          pathFile: config.uploads.storage === 's3' && config.aws.s3 ?
            req.file.location :
            '/' + req.file.path,
        };
        res.json(objFile);
      })
      .catch(function (err) {
        res.status(422).send(err);
      });

  function uploadImage() {
    return new Promise(function (resolve, reject) {
      upload(req, res, function (uploadError) {
        if (uploadError) {
          reject(errorHandler.getErrorMessage(uploadError));
        } else {
          resolve();
        }
      });
    });
  }


  function deleteOldImage() {
    return new Promise(function (resolve, reject) {
      if (existingImageUrl !== User.schema.path('profileImageURL').defaultValue) {
        if (useS3Storage) {
          try {
            var { region, bucket, key } = amazonS3URI(existingImageUrl);
            var params = {
              Bucket: config.aws.s3.bucket,
              Key: key
            };

            s3.deleteObject(params, function (err) {
              if (err) {
                console.log('Error occurred while deleting old profile picture.');
                console.log('Check if you have sufficient permissions : ' + err);
              }

              resolve();
            });
          } catch (err) {
            console.warn(`${existingImageUrl} is not a valid S3 uri`);

            return resolve();
          }
        } else {
          fs.unlink(path.resolve('.' + existingImageUrl), function (unlinkError) {
            if (unlinkError) {

              // If file didn't exist, no need to reject promise
              if (unlinkError.code === 'ENOENT') {
                console.log('Removing profile image failed because file did not exist.');
                return resolve();
              }

              console.error(unlinkError);

              reject({
                message: 'Error occurred while deleting old profile picture'
              });
            } else {
              resolve();
            }
          });
        }
      } else {
        resolve();
      }
    });
  }

};

/**
 * Show the current post
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var post = req.post ? req.post.toJSON() : {};

  // Add a custom field to the Post, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Post model.
  // post.isCurrentUserOwner = !!(req.user && post.user && post.user._id.toString() === req.user._id.toString());

  res.json(post);
};

/**
 * Update an post
 */
exports.update = function (req, res) {
  var post = req.post;

  post.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(post);
    }
  });
};

/**
 * Delete an post
 */
exports.delete = function (req, res) {
  var post = req.post;

  post.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(post);
    }
  });
};

/**
 * List of posts
 */
exports.list = function (req, res) {
  Post.find({threadParent: req.post.number}).sort('created').exec(function (err, posts) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(posts);
    }
  });
};

/**
 * Post middleware
 */
exports.postByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Post is invalid'
    });
  }

    Post.findById(id).exec(function (err, post) {
    if (err) {
      return next(err);
    } else if (!post) {
      return res.status(404).send({
        message: 'No post with that identifier has been found'
      });
    }
    req.post = post;
    next();
  });
};
