(function () {
  'use strict';

  angular
    .module('posts')
    .controller('PostsController', PostsController);

  PostsController.$inject = ['$scope', '$state', '$window','$timeout', 'postResolve', 'Authentication', 'Upload', 'Notification', 'PostsService', 'ListPostsService'];

  function PostsController($scope, $state, $window, $timeout, post, Authentication, Upload, Notification, PostsService, ListPostsService) {
    var vm = this;

    console.log(post);
    // vm.posts = new ListPostsService().getList(post); //new ListPostsService.query(); ////post.getList(); //PostsService.query();
    vm.posts = post;
    vm.post = /*post;*/new PostsService();
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.progress = 0;

    // Remove existing post
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.post.$remove(function () {
          $state.go('posts.list');
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

      function upload (dataUrl) {
        if(dataUrl){
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
        }else{
          onSuccessItem();
        }
      };

      // Called after the user has successfully uploaded a new picture
      function onSuccessItem(response) {
        
        // Show success message
        // Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Successfully uploaded file' });

        // Populate user object
        // vm.user = Authentication.user = response;

        // Reset form
        vm.fileSelected = false;
        vm.progress = 0;

        if($scope.picFile){
          var fileAttached = {
            fileURL:response.pathFile,
            mimetype: $scope.picFile.type,
            origFileName: $scope.picFile.name,
            weight: $scope.picFile.size,
            height: $scope.picFile.$ngfHeight,
            width: $scope.picFile.$ngfWidth,
          };

          if(!!(!vm.post.content)){
            var content = {
              content:{
                fileAttached:fileAttached,
              }
            };
            vm.post = Object.assign(vm.post, content);
          }else{
            vm.post.content = Object.assign(vm.post.content, {fileAttached});
          }

        }

        vm.post.specialID = vm.post.getSpecialID(vm.post.isOP, vm.post.threadParent);

        // Create a new post, or update the current instance
        vm.post.createOrUpdate()
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
        $state.go('posts.list'); // should we send the User to the list or the updated post's view?
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Post saved successfully!' });
      }

      function errorCallback(res) {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Post save error!' });
      }

      upload($scope.picFile);
    }
  }
}());
