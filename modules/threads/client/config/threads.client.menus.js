(function () {
  'use strict';

  angular
    .module('threads')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Threads',
      state: 'threads.list',
      roles: ['*']
    });
  }
}());
