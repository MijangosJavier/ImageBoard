'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  chalk = require('chalk');

var validateContent = function () {
  return (this.content.comment!=='' || this.content.fileAttached.origFileName!==undefined);
};

var validateOP = function () {
  return (this.isOP ? 
    (
      this.content.comment!=='' &&
      this.content.fileAttached.origFileName!==undefined
    ) :
      true
  );
};

var validateName = function (name) {
  var nameRegex = /[^A-Za-z0-9]/;
  return !nameRegex.test(name);
};

/**
 * Post Schema
 */
var PostSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  topic: {
    type: String,
    default: '',
    trim: true,
  },
  content: {
    comment:{
      type: String,
      default: '',
      trim: true,
      maxlength:[2000, 'Post too long, max number of characters is 2000'],
      validate: [validateContent, 'Post can not be empty'],
    },
    fileAttached:{
      fileURL:{
        type: String,
      },
      mimetype:{
        type: String,
      },
      width:{
        type: Number,
      },
      height:{
        type: Number,
      },
      weight: {
        type: String,
      },
      origFileName:{
        type: String,
      },
    },   
  },
  specialID:{
    type: String,
    default: '00000000',
    trim: true,
    minlength: 8,
    maxlength: 8,
  },
  number:{
    type: Number,
    index: true,
    unique: true,
  },
  isOP:{
    type: Boolean,
    default: false,
    validate: [validateOP, 'Thread must have a picture and a comment'],
  },
  threadParent:{
    type: Number,
  },
  isUser:{
    type: Boolean,
    default: false,
  },
  name:{
    type: String,
    default: 'Anonymous',
    validate: [validateName, 'Please enter a valid name, use only alphanumeric characters'],
    maxlength: [24 , 'Name too long, max character count is 24'],
  },
  replies:{
    type:[{
      type: Number,
    }],
  },
});

PostSchema.pre('save', function (next) {
  var _this = this;
  if(this.number === undefined){
    this.findLastPost()
      .then(function (lastPost){
        _this.number = lastPost !== null ? lastPost.number + 1 : 1;
        _this.threadParent= _this.isOP ? _this.number : 1/*Must be post.threadPatent OR Number of thrad*/;
        next();
      })
      .catch(function (err) {
        next(err);
      });
  }else{
    next();
  }
});

PostSchema.methods.findLastPost = function () {
  var Post = mongoose.model('Post');
  return new Promise(function (resolve, reject) {
    Post
      .findOne({})
      .sort({_id: -1})
      // .limit(1)
      .exec(function (err, lastPost) {
        if (err) {
          return reject(err);
        }
        return resolve(lastPost);
      });
  });
};

PostSchema.statics.seed = seed;

mongoose.model('Post', PostSchema);

/**
* Seeds the User collection with document (Post)
* and provided options.
*/
function seed(doc, options) {
  var Post = mongoose.model('Post');

  return new Promise(function (resolve, reject) {

    skipDocument()
      // .then(findAdminUser)
      .then(add)
      .then(function (response) {
        return resolve(response);
      })
      .catch(function (err) {
        return reject(err);
      });

    function findAdminUser(skip) {
      var User = mongoose.model('User');

      return new Promise(function (resolve, reject) {
        if (skip) {
          return resolve(true);
        }

        User
          .findOne({
            roles: { $in: ['admin'] }
          })
          .exec(function (err, admin) {
            if (err) {
              return reject(err);
            }

            doc.user = admin;

            return resolve();
          });
      });
    }

    function skipDocument() {
      return new Promise(function (resolve, reject) {
        Post
          .findOne({
            title: doc.title
          })
          .exec(function (err, existing) {
            if (err) {
              return reject(err);
            }

            if (!existing) {
              return resolve(false);
            }

            if (existing && !options.overwrite) {
              return resolve(true);
            }

            // Remove Post (overwrite)

            existing.remove(function (err) {
              if (err) {
                return reject(err);
              }

              return resolve(false);
            });
          });
      });
    }

    function add(skip) {
      return new Promise(function (resolve, reject) {
        if (skip) {
          return resolve({
            message: chalk.yellow('Database Seeding: Post\t' + doc.title + ' skipped')
          });
        }

        var post = new Post(doc);

        post.save(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'Database Seeding: Post\t' + post.title + ' added'
          });
        });
      });
    }

  });
}


