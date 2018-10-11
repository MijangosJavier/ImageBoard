(function () {
  'use strict';

  angular
    .module('threads.services')
    .factory('ThreadsService', ThreadsService);

  ThreadsService.$inject = ['$resource', '$log'];

  function ThreadsService($resource, $log) {
    var Thread = $resource('/api/threads/:threadId', {
      threadId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Thread.prototype, {
      createOrUpdate: function () {
        var thread = this;
        return createOrUpdate(thread);
      }
    });

    return Thread;

    function createOrUpdate(thread) {
      if (thread._id) {
        return thread.$update(onSuccess, onError);
      } else {
        return thread.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(thread) {
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
