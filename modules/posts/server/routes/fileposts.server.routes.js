'use strict';

/**
 * Module dependencies
 */
var postsPolicy = require('../policies/posts.server.policy'),
  posts = require('../controllers/posts.server.controller');

module.exports = function (app) {

  app.route('/api/fileposts/postfile').all(postsPolicy.isAllowed)
    .post(posts.uploadFile);

};
