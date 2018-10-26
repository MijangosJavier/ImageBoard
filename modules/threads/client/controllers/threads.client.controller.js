(function () {
  'use strict';

  angular
    .module('threads')
    .controller('ThreadsController', ThreadsController);

  ThreadsController.$inject = ['$scope', '$state', '$window', '$timeout', 'threadResolve', 'Authentication', 'Upload', 'Notification'];

  function ThreadsController($scope, $state, $window, $timeout, thread, Authentication, Upload, Notification) {
    var vm = this;

    vm.thread = thread;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.progress = 0;

    // Remove existing post
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.thread.$remove(function () {
          $state.go('threads.list');
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Thread deleted successfully!' });
        });
      }
    }

    // Save thread
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.threadForm');
        return false;
      }

      var threadPost = {};

      function upload(dataUrl) {
        if (dataUrl && $scope.comment) {
          Upload.upload({
            url: '/api/fileposts/postfile',
            data: {
              newPostFile: dataUrl
            }
          }).then(function (response) {
            $timeout(function () {
              onSuccessItem(response.data);
            });
          }, function (response) {
            if (response.status > 0) onErrorItem(response.data);
          }, function (evt) {
            vm.progress = parseInt(100.0 * evt.loaded / evt.total, 10);
          });
        } else {
          onSuccessItem();
        }
      }

      // Called after the user has successfully uploaded a new picture
      function onSuccessItem(response) {
        if ($scope.picFile && $scope.comment) {
          vm.fileSelected = false;
          vm.progress = 0;
          var fileAttached = {
            fileURL: response.pathFile,
            mimetype: $scope.picFile.type,
            origFileName: $scope.picFile.name,
            weight: $scope.picFile.size,
            height: $scope.picFile.$ngfHeight,
            width: $scope.picFile.$ngfWidth
          };

          threadPost = {
            content: {
              fileAttached: fileAttached,
              comment: $scope.comment
            },
            specialID: vm.thread.getSpecialID(true, vm.thread.number),
            isOP: true,
            name: $scope.name
          };
          vm.thread = Object.assign(vm.thread, threadPost);
        }
        // Create a new post, or update the current instance
        vm.thread.createOrUpdate()
          .then(successCallback)
          .catch(errorCallback);
      }
      // Called after the user has failed to upload a new picture
      function onErrorItem(response) {
        vm.fileSelected = false;
        vm.progress = 0;

        // Show error message
        Notification.error({ message: response.message, title: '<i class="glyphicon glyphicon-remove"></i> Failed to upload file' });
      }

      function successCallback(res) {
        var sID = vm.thread.getSpecialID(true, res.number);
        $state.go('posts.view', { postId: res._id.toString() }/* 'threads.list'*/); // should we send the User to the list or the updated post's view?
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Thread saved successfully!' });
      }

      function errorCallback(res) {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Post save error!' });
      }

      upload($scope.picFile);
    }

  }
}());
