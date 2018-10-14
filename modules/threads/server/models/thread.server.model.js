'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  chalk = require('chalk');

/**
 * thread Schema
 */
var ThreadSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  topic: {
    type: String,
    default: '',
    trim: true,
  },
  number:{
    type: Number,
  },
});

ThreadSchema.statics.seed = seed;

mongoose.model('Thread', ThreadSchema);

/**
* Seeds the User collection with document (Thread)
* and provided options.
*/
function seed(doc, options) {
  var Thread = mongoose.model('Thread');

  return new Promise(function (resolve, reject) {

    skipDocument()
      .then(add)
      .then(function (response) {
        return resolve(response);
      })
      .catch(function (err) {
        return reject(err);
      });

    function skipDocument() {
      return new Promise(function (resolve, reject) {
        Thread
          .findOne({
            number: doc.number
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

            // Remove Thread (overwrite)

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
            message: chalk.yellow('Database Seeding: Thread\t' + doc.topic + ' skipped')
          });
        }

        var thread = new Thread(doc);

        thread.save(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'Database Seeding: Thread\t' + thread.topic + ' added'
          });
        });
      });
    }
  });
}
