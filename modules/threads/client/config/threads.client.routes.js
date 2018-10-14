(function () {
  'use strict';

  angular
    .module('threads.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('threads', {
        abstract: true,
        url: '/threads',
        template: '<ui-view/>'
      })
      .state('threads.list', {
        url: '',
        templateUrl: '/modules/threads/client/views/list-threads.client.view.html',
        controller: 'ThreadsListController',
        controllerAs: 'vm'
      })
      .state('threads.create', {
        url: '/create',
        templateUrl: '/modules/threads/client/views/admin/form-thread.client.view.html',
        controller: 'ThreadsController',
        controllerAs: 'vm',
        resolve: {
          threadResolve: newThread
        }
      })
      .state('threads.edit', {
        url: '/:threadId/edit',
        templateUrl: '/modules/threads/client/views/admin/form-thread.client.view.html',
        controller: 'ThreadsController',
        controllerAs: 'vm',
        data: {
          pageTitle: '{{ threadResolve.title }}'
        },
        resolve: {
          threadResolve: getThread
        }
      })
      .state('threads.view', {
        url: '/:threadId',
        templateUrl: '/modules/threads/client/views/view-thread.client.view.html',
        controller: 'ThreadsController',
        controllerAs: 'vm',
        resolve: {
          threadResolve: getThread
        },
        data: {
          pageTitle: '{{ threadResolve.title }}'
        }
      });
  }

  getThread.$inject = ['$stateParams', 'ThreadsService'];

  function getThread($stateParams, ThreadsService) {
    return ThreadsService.get({
      threadId: $stateParams.threadId
    }).$promise;
  }

  newThread.$inject = ['ThreadsService'];

  function newThread(ThreadsService) {
    return new ThreadsService();
  }
  
}());
