(function () {
  'use strict';

  angular
    .module('threads.admin')
    .controller('ThreadsAdminListController', ThreadsAdminListController);

  ThreadsAdminListController.$inject = ['ThreadsService'];

  function ThreadsAdminListController(ThreadsService) {
    var vm = this;

    vm.threads = ThreadsService.query();
  }
}());
