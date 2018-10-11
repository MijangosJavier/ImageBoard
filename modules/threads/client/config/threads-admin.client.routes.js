(function () {
  'use strict';

  angular
    .module('threads.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.threads', {
        abstract: true,
        url: '/threads',
        template: '<ui-view/>'
      })
      .state('admin.threads.list', {
        url: '',
        templateUrl: '/modules/threads/client/views/admin/list-threads.client.view.html',
        controller: 'ThreadsAdminListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        }
      })
      .state('admin.threads.create', {
        url: '/create',
        templateUrl: '/modules/threads/client/views/admin/form-thread.client.view.html',
        controller: 'ThreadsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          threadResolve: newThread
        }
      })
      .state('admin.threads.edit', {
        url: '/:threadId/edit',
        templateUrl: '/modules/threads/client/views/admin/form-thread.client.view.html',
        controller: 'ThreadsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ threadResolve.title }}'
        },
        resolve: {
          threadResolve: getThread
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
