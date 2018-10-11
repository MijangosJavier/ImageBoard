(function () {
  'use strict';

  angular
    .module('threads')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Threads',
      state: 'threads',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'threads', {
      title: 'List Threads',
      state: 'threads.list',
      roles: ['*']
    });
  }
}());
