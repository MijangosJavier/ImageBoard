(function () {
  'use strict';

  angular
    .module('threads')
    .controller('ThreadsListController', ThreadsListController);

  ThreadsListController.$inject = ['ThreadsService'];

  function ThreadsListController(ThreadsService) {
    var vm = this;

    vm.threads = ThreadsService.query();
  }
}());
