(function () {
  'use strict';

  angular
    .module('posts.services')
    .factory('ListPostsService', ListPostsService);

  ListPostsService.$inject = ['$resource', '$log'];

  function ListPostsService($resource, $log) {
    var Post = $resource('/api/posts/list/:postId', {
      postId: '@_id'
    }, {
      query: {
        method: 'GET',
        isArray: true
      }
    });

    angular.extend(Post.prototype, {
      getList: function () {
        var post = this;
        return getList(post);
      }

    });
    return Post;

    function getList(post) {
      return post.$query(onSuccess, onError);

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

    function handleError(error) {
      // Log error
      $log.error(error);
    }
  }
}());
