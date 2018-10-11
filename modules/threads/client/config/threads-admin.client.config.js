(function () {
  'use strict';

  // Configuring the Threads Admin module
  angular
    .module('threads.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Threads',
      state: 'admin.threads.list'
    });
  }
}());
