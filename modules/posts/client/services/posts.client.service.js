(function () {
  'use strict';

  angular
    .module('posts.services')
    .factory('PostsService', PostsService);

  PostsService.$inject = ['$resource', '$log'];

  function PostsService($resource, $log) {
    var Post = $resource('/api/posts/:postId', {
      postId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Post.prototype, {
      createOrUpdate: function () {
        var post = this;
        return createOrUpdate(post);
      },
      getSpecialID: function(isOP, threadNumber) {
        return getSpecialID(isOP, threadNumber);
      }

    });

    return Post;

    function createOrUpdate(post) {
      if (post._id) {
        return post.$update(onSuccess, onError);
      } else {
        return post.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(post) {
        // Any required internal processing from inside the service, goes here.
      }

      // Handle error response
      function onError(errorResponse) {
        var error = errorResponse.data;
        // Handle error internally
        handleError(error);
      }
    }

    function setCookie(threadNumber, specialID, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      var expires = "expires="+d.toUTCString();
      document.cookie = threadNumber + "=" + specialID + ";" + expires /*+ ";path=/"*/;
    }

    function getCookie(threadNumber) {
      var specialID = threadNumber + "=";
      var ca = document.cookie.split(';');
      for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(specialID) == 0) {
          return c.substring(specialID.length, c.length);
        }
      }
      return "";
    }

    function getSpecialID(isOP=false, threadNumber){
      if(!isOP){
        threadNumber = 2;//placeholder should be the real number
        threadNumber = threadNumber.toString();

        var cSpecialID = getCookie(threadNumber);
        if(cSpecialID != ""){
          return cSpecialID;
        }else{
          setCookie(threadNumber, randomString(8), 30);
          return getCookie(threadNumber);
        }
        
      }else{
        if(!!(threadNumber)){
          threadNumber = threadNumber.toString();
          var cSpecialID = getCookie('tempThreadNumber');
          setCookie(threadNumber, cSpecialID, 30);
        }else{
          threadNumber = 'tempThreadNumber';
          setCookie(threadNumber, randomString(8), 1);
        }

        return getCookie(threadNumber);
      }
    }

    function randomString(length) {
      var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      var result = '';
      for (var i = length; i > 0; --i){
        result += chars[Math.floor(Math.random() * chars.length)];
      } 
      return result;
    }

    function handleError(error) {
      // Log error
      $log.error(error);
    }
  }
}());
