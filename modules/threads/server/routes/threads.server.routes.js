'use strict';

/**
 * Module dependencies
 */
var threadsPolicy = require('../policies/threads.server.policy'),
  threads = require('../controllers/threads.server.controller');

module.exports = function (app) {
  // threads collection routes
  app.route('/api/threads').all(threadsPolicy.isAllowed)
    .get(threads.list)
    .post(threads.create);

  // Single thread routes
  app.route('/api/threads/:threadId').all(threadsPolicy.isAllowed)
    .get(threads.read)
    .put(threads.update)
    .delete(threads.delete);

  // Finish by binding the thread middleware
  app.param('threadId', threads.threadByID);
};
