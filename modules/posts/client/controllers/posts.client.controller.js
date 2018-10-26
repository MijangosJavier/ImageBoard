(function () {
  'use strict';

  angular
    .module('posts', ['ngSanitize'])
    .controller('PostsController', PostsController);

  PostsController.$inject = ['$scope', '$state', '$window', '$timeout', 'postResolve', 'Authentication', 'Upload', 'Notification', 'PostsService', 'ListPostsService', '$sce'];

  function PostsController($scope, $state, $window, $timeout, post, Authentication, Upload, Notification, PostsService, ListPostsService, $sce) {
    var vm = this;
    vm.posts = post;
    vm.post = new PostsService();
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.progress = 0;
    vm.floatingForm = false;
    vm.showF = showFloatingForm;
    vm.hideF = hideFloatingForm;
    vm.scrollTo = scrollTo;
    vm.refresh = refresh;
    formatComment();

    // Remove existing post
    function remove(removablePost) {
      if ($window.confirm('Are you sure you want to delete?')) {
        var service = new PostsService();
        service._id = removablePost._id;
        service.$remove(function () {
          if (!removablePost.isOP) {
            $state.reload();
            Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Post deleted successfully!' });
          } else {
            $state.go('admin.threads.list');
            Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Thread deleted successfully!' });
          }
        });
      }
    }

    // Save post
    function save(isValid) {
      if (!isValid) {
        if (vm.floatingForm) {
          $scope.$broadcast('show-errors-check-validity', 'vm.form.postFormFloating');
        } else {
          $scope.$broadcast('show-errors-check-validity', 'vm.form.postForm');
        }
        return false;
      }

      function upload(dataUrl) {
        if (dataUrl) {
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

        // Reset form
        vm.fileSelected = false;
        vm.progress = 0;

        if (vm.picFile) {
          var fileAttached = {
            fileURL: response.pathFile,
            mimetype: vm.picFile.type,
            origFileName: vm.picFile.name,
            weight: vm.picFile.size,
            height: vm.picFile.$ngfHeight,
            width: vm.picFile.$ngfWidth
          };

          if (!!(!vm.post.content)) {
            var content = {
              content: {
                fileAttached: fileAttached
              }
            };
            vm.post = Object.assign(vm.post, content);
          } else {
            vm.post.content = Object.assign(vm.post.content, { fileAttached });
          }

        }

        var procesedStr;
        var replies = [];
        var repliesInPost = [];
        var cleanedReplies = [];
        var repliesIDs = [];

        function searchLinks(str) {
          var startLinkIndex = str.indexOf('>>');

          if (startLinkIndex === -1) {
            return replies;
          }

          var res = str.substr(startLinkIndex, str.length);
          var validLink = /^>>[0-9]/.test(res);

          if (validLink) {
            var link = res[2];
            var lastIndex = 3;
            for (var i = 3; i < res.length; i++) {
              if (/[0-9]/.test(res[i])) {
                link = link + res[i];
                lastIndex = i;
              } else {
                lastIndex = i;
                break;
              }
            }
            res = res.substr(lastIndex, res.length);
            replies.push(link);
          } else {
            var lastInvalidIndex = 0;
            for (var j = 0; j < res.length; j++) {
              if (/[>]/.test(res[j])) {
                lastInvalidIndex = j;
              } else {
                lastInvalidIndex = j;
                break;
              }
            }
            res = res.substr(lastInvalidIndex, res.length);
          }
          return searchLinks(res);
        }

        if (!!(vm.post.content && vm.post.content.comment)) {
          repliesInPost = searchLinks(vm.post.content.comment);
        }

        function cleanRepliesList(list) {
          var cleanList = [];
          list.forEach(function (elem) {
            var replyNum = Number(elem);
            if (!cleanList.includes(replyNum)) {
              cleanList.push(replyNum);
            }
          });
          return cleanList;
        }

        if (repliesInPost.length > 0) {
          cleanedReplies = cleanRepliesList(repliesInPost);

          cleanedReplies.forEach(function (elem) {
            for (var key in vm.posts) {
              if (vm.posts[key].number === elem) {
                repliesIDs.push(vm.posts[key]._id);
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
        $state.reload();
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Post saved successfully!' });
      }

      function errorCallback(res) {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Post save error!' });
      }

      upload(vm.picFile);
    }

    function showFloatingForm(postNumber) {
      vm.floatingForm = true;
      if (!vm.post.content) {
        vm.post.content = {
          comment: ''
        };
      } else if (!vm.post.content.comment) {
        vm.post.content.comment = '';
      }
      vm.post.content.comment = vm.post.content.comment + '>>' + postNumber + '\n';
    }

    function hideFloatingForm() {
      vm.floatingForm = false;
      vm.post.name = undefined;
      vm.post.content.comment = undefined;
      vm.post.content = undefined;
      vm.fileSelected = false;
      vm.picFile = undefined;
    }

    function scrollTo(elemID) {
      var currentFocusedElem = document.querySelector('.focused');

      if (!!(currentFocusedElem)) {
        currentFocusedElem.classList.remove('focused');
      }

      var elmnt = document.getElementById(elemID);
      try {
        elmnt.classList.add('focused');
        elmnt.scrollIntoView({ block: 'center' });
      } catch (err) {
        Notification.error({ message: 'Post was deleted', title: '<i class="glyphicon glyphicon-remove"></i> Post link error!' });
      }
    }

    function refresh() {
      $state.reload();
    }

    function findLink(str, parentElem) {
      var startLinkIndex = str.indexOf('>>');
      var text;
      if (startLinkIndex === -1) {
        parentElem = parentElem + str;
        return parentElem;
      }

      if (startLinkIndex > 0) {
        parentElem = parentElem + str.substr(0, startLinkIndex);
      }

      var res = str.substr(startLinkIndex, str.length);
      var validLink = /^>>[0-9]/.test(res);

      function postExist(elemNum) {
        for (var key in vm.posts) {
          if (vm.posts[key].number === elemNum) {
            return { exist: true, specialID: vm.posts[key].specialID, isOP: vm.posts[key].isOP };
          }
        }
        return false;
      }

      if (validLink) {
        var link = res.substr(0, 3);
        var lastIndex = 3;
        for (var i = 3; i < res.length; i++) {
          if (/[0-9]/.test(res[i])) {
            link = link + res[i];
            lastIndex = i + 1;
          } else {
            lastIndex = i;
            break;
          }
        }
        res = res.substr(lastIndex, res.length);

        var linkNumber = Number(link.substr(2, link.length));

        var postLinked = postExist(linkNumber);

        if (postLinked.exist) {
          parentElem = parentElem + '<span class="fake-link" onclick="scrollToPost(' + linkNumber.toString() + ')">>>' + linkNumber;
          vm.post.threadParent = vm.posts[0].threadParent;
          if (postLinked.specialID === vm.post.getSpecialID(false, vm.post.threadParent)) {
            parentElem = parentElem + '(you)';
          }
          if (postLinked.isOP) {
            parentElem = parentElem + '(OP)';
          }
          parentElem = parentElem + '</span>';

        } else {
          parentElem = parentElem + '<span class="fake-link-invalid" >>>' + linkNumber + '</span>';
        }
      } else {
        var lastInvalidIndex = 0;
        for (var j = 0; j < res.length; j++) {
          if (/[>]/.test(res[j])) {
            lastInvalidIndex = j;
          } else {
            lastInvalidIndex = j;
            break;
          }
        }
        parentElem = parentElem + res.substr(0, lastInvalidIndex);
        res = res.substr(lastInvalidIndex, res.length);
      }
      return findLink(res, parentElem);
    }

    function formatComment() {
      for (var key in vm.posts) {
        if (!!(vm.posts[key].content && vm.posts[key].content.comment)) {
          var origStr = vm.posts[key].content.comment;
          var parentElem = '<p>';
          parentElem = findLink(origStr, parentElem);
          parentElem = parentElem + '</p>';
          vm.posts[key].formattedComment = $sce.trustAsHtml(parentElem);
        } else {
          // Do nothing
        }
      }
    }
  }
}());
