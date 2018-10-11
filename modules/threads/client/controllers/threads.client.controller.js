(function () {
  'use strict';

  angular
    .module('threads')
    .controller('ThreadsController', ThreadsController);

  ThreadsController.$inject = ['$scope', 'threadResolve', 'Authentication'];

  function ThreadsController($scope, thread, Authentication) {
    var vm = this;

    vm.thread = thread;
    vm.authentication = Authentication;

  }
}());
