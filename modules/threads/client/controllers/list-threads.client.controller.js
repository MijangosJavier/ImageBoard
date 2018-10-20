(function () {
  'use strict';

  angular
    .module('threads')
    .controller('ThreadsListController', ThreadsListController);

  ThreadsListController.$inject = ['$scope', '$window', 'ThreadsService', '$state'];

  function ThreadsListController($scope, $window, ThreadsService, $state) {
    var vm = this;

    vm.threads = ThreadsService.query();
    vm.loaded = false;
    vm.curPage = 1;
    vm.itemsPerPage = 6;
    vm.maxSize = 5;
    vm.refresh = refresh;

    vm.init = function () {
      vm.loaded = true;
      var begin = ((vm.curPage - 1) * vm.itemsPerPage),
        end = begin + vm.itemsPerPage;
      vm.filteredItems = $scope.totalThreads.slice(begin, end);
      $window.scrollTo(0, 0);
    };

    function refresh() {
      $state.reload();
    }

  }
}());
