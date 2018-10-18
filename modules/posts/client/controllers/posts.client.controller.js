(function () {
  'use strict';

  angular
    .module('posts')
    .controller('PostsController', PostsController);

  PostsController.$inject = ['$scope', '$state', '$window','$timeout', 'postResolve', 'Authentication', 'Upload', 'Notification', 'PostsService', 'ListPostsService'];

  function PostsController($scope, $state, $window, $timeout, post, Authentication, Upload, Notification, PostsService, ListPostsService) {
    var vm = this;
    // vm.posts = new ListPostsService().getList(post); //new ListPostsService.query(); ////post.getList(); //PostsService.query();
    vm.posts = post;
    vm.post = /*post;*/new PostsService();
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.progress = 0;
    vm.floatingForm = false;
    vm.showF = showFloatingForm;
    vm.hideF = hideFloatingForm;
    vm.scrollTo = scrollTo;
    

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
        if(vm.floatingForm){
          $scope.$broadcast('show-errors-check-validity', 'vm.form.postFormFloating');
        }else{
          $scope.$broadcast('show-errors-check-validity', 'vm.form.postForm');
        }
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

        var origStr = vm.post.content.comment;//document.forms["vm.form.postForm"]["comment"].value;
        var procesedStr;
        var replies=[];
        var repliesInPost = [];
        var cleanedReplies = [];
        var repliesIDs = [];
        
        //var startLinkIndex = origStr.indexOf(">>");
        function searchLinks(str){
          var startLinkIndex = str.indexOf(">>");
          
          if(startLinkIndex === -1){
            return replies;
          }
          
          var res = str.substr(startLinkIndex, str.length);
          var validLink = /^>>[0-9]/.test(res);
          
          if(validLink){
            var link=res[2];
            var lastIndex=3;
            for(var i=3; i < res.length; i++){
              if(/[0-9]/.test(res[i])){
                link = link + res[i];
                lastIndex=i;
              }else{
                lastIndex=i;
                break;
              }
            }
            res = res.substr(lastIndex, res.length);
            replies.push(link);
          }else{
            var lastInvalidIndex=0;
            for(var j=0; j < res.length; j++){
              if(/[>]/.test(res[j])){
                lastInvalidIndex=j;
              }else{
                lastInvalidIndex=j;
                break;
              }
            }
            res = res.substr(lastInvalidIndex, res.length);
          }
          return searchLinks(res);
        }
        
        //console.log(searchLinks(origStr));
        if(!!(vm.post.content.comment)){
          repliesInPost = searchLinks(origStr);
        }

        if(repliesInPost.length > 0){

          function cleanRepliesList (list){
            var cleanList=[]
            list.forEach(function(elem){
              var replyNum = Number(elem)
              if(!cleanList.includes(replyNum)){
                cleanList.push(replyNum);
              }
            });
            return cleanList;
          }
          cleanedReplies = cleanRepliesList(repliesInPost);

          cleanedReplies.forEach(function (elem){
            for(var key in vm.posts){
              var objPost = vm.posts[key];
              if(objPost.number === elem){
                repliesIDs.push(objPost._id);
                break;
              } 
            }
          });

        }


        vm.post.IDList = repliesIDs;
        vm.post.threadParent = vm.posts[0].number;
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
        $state.reload();//$state.go('posts.view', {postId: vm.posts[0]._id.toString()}/*'threads.list'*/);// $state.go('posts.list'); // should we send the User to the list or the updated post's view?
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Post saved successfully!' });
      }

      function errorCallback(res) {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Post save error!' });
      }

      upload($scope.picFile);
    }

    function showFloatingForm(postNumber){
      vm.floatingForm = true;
      if(!vm.post.content){
        vm.post.content={
          comment: ""
        };
      }else if (!vm.post.content.comment){
        vm.post.content.comment="";
      }
      vm.post.content.comment = vm.post.content.comment + ">>" + postNumber +"\n";
      document.forms['vm.form.postFormFloating'].elements['comment'].focus();
    }

    function hideFloatingForm(){
      vm.floatingForm = false;
      vm.post.name = undefined;
      vm.post.content.comment = undefined;
      vm.post.content= undefined;
      vm.fileSelected = false;
      $scope.picFile = undefined;
    }

    function scrollTo(elemID){
      var elmnt = document.getElementById(elemID);
      elmnt.scrollIntoView({ block:"center"});
    }

  }
}());
