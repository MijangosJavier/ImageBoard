(function (app) {
  'use strict';

  app.registerModule('posts', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('posts.admin', ['core.admin']);
  app.registerModule('posts.admin.routes', ['core.admin.routes']);
  app.registerModule('posts.services');
  app.registerModule('posts.routes', ['ui.router', 'core.routes', 'posts.services']);
}(ApplicationConfiguration));
