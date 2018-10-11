(function (app) {
  'use strict';

  app.registerModule('threads', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('threads.admin', ['core.admin']);
  app.registerModule('threads.admin.routes', ['core.admin.routes']);
  app.registerModule('threads.services');
  app.registerModule('threads.routes', ['ui.router', 'core.routes', 'threads.services']);
}(ApplicationConfiguration));
