(function () {
  'use strict';

  angular
    .module('posts.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.posts', {
        abstract: true,
        url: '/posts',
        template: '<ui-view/>'
      })
      .state('admin.posts.list', {
        url: '',
        templateUrl: '/modules/posts/client/views/admin/list-posts.client.view.html',
        controller: 'PostsAdminListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        }
      })
      .state('admin.posts.create', {
        url: '/create',
        templateUrl: '/modules/posts/client/views/admin/form-post.client.view.html',
        controller: 'PostsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          postResolve: newPost
        }
      })
      .state('admin.posts.edit', {
        url: '/:postId/edit',
        templateUrl: '/modules/posts/client/views/admin/form-post.client.view.html',
        controller: 'PostsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ postResolve.title }}'
        },
        resolve: {
          postResolve: getPost
        }
      });
  }

  getPost.$inject = ['$stateParams', 'PostsService'];

  function getPost($stateParams, PostsService) {
    return PostsService.get({
      postId: $stateParams.postId
    }).$promise;
  }

  newPost.$inject = ['PostsService'];

  function newPost(PostsService) {
    return new PostsService();
  }
}());
