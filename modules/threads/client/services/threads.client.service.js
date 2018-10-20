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
      },
      getSpecialID: function (isOP, threadNumber) {
        return getSpecialID(isOP, threadNumber);
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

    function setCookie(threadNumber, specialID, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      var expires = 'expires=' + d.toUTCString();
      document.cookie = threadNumber + '=' + specialID + ';' + expires;
    }

    function getCookie(threadNumber) {
      var specialID = threadNumber + '=';
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(specialID) === 0) {
          return c.substring(specialID.length, c.length);
        }
      }
      return '';
    }

    function getSpecialID(isOP = false, threadNumber) {
      var cSpecialID;
      if (!isOP) {
        // threadNumber = 2;//placeholder should be the real number
        threadNumber = threadNumber.toString();

        cSpecialID = getCookie(threadNumber);
        if (cSpecialID !== '') {
          return cSpecialID;
        } else {
          setCookie(threadNumber, randomString(8), 30);
          return getCookie(threadNumber);
        }
      } else {
        if (!!(threadNumber)) {
          threadNumber = threadNumber.toString();
          cSpecialID = getCookie('tempThreadNumber');
          setCookie(threadNumber, cSpecialID, 30);
        } else {
          threadNumber = 'tempThreadNumber';
          setCookie(threadNumber, randomString(8), 1);
        }
        return getCookie(threadNumber);
      }
    }

    function randomString(length) {
      var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      var result = '';
      for (var i = length; i > 0; --i) {
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
