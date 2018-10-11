(function () {
  'use strict';

  angular
    .module('posts.admin')
    .controller('PostsAdminController', PostsAdminController);

  PostsAdminController.$inject = ['$scope', '$state', '$window', 'postResolve', 'Authentication', 'Notification'];

  function PostsAdminController($scope, $state, $window, post, Authentication, Notification) {
    var vm = this;

    vm.post = post;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing post
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.post.$remove(function () {
          $state.go('admin.posts.list');
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Post deleted successfully!' });
        });
      }
    }

    // Save post
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.postForm');
        return false;
      }

      // Create a new post, or update the current instance
      vm.post.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('admin.posts.list'); // should we send the User to the list or the updated post's view?
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Post saved successfully!' });
      }

      function errorCallback(res) {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Post save error!' });
      }
    }
  }
}());
