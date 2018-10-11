(function () {
  'use strict';

  angular
    .module('threads.admin')
    .controller('ThreadsAdminController', ThreadsAdminController);

  ThreadsAdminController.$inject = ['$scope', '$state', '$window', 'threadResolve', 'Authentication', 'Notification'];

  function ThreadsAdminController($scope, $state, $window, thread, Authentication, Notification) {
    var vm = this;

    vm.thread = thread;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing thread
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.thread.$remove(function () {
          $state.go('admin.threads.list');
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Thread deleted successfully!' });
        });
      }
    }

    // Save Thread
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.threadForm');
        return false;
      }

      // Create a new thread, or update the current instance
      vm.thread.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('admin.threads.list'); // should we send the User to the list or the updated Thread's view?
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Thread saved successfully!' });
      }

      function errorCallback(res) {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Thread save error!' });
      }
    }
  }
}());
