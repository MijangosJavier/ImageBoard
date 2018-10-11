(function () {
  'use strict';

  angular
    .module('posts.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('posts', {
        abstract: true,
        url: '/posts',
        template: '<ui-view/>'
      })
      .state('posts.list', {
        url: '',
        templateUrl: '/modules/posts/client/views/list-posts.client.view.html',
        controller: 'PostsListController',
        controllerAs: 'vm'
      })
      .state('posts.create', {
        url: '/create',
        templateUrl: '/modules/posts/client/views/admin/form-post.client.view.html',
        controller: 'PostsController',
        controllerAs: 'vm',
        // data: {
        //   roles: ['admin']
        // },
        resolve: {
          postResolve: newPost
        }
      })
      .state('posts.view', {
        url: '/:postId',
        templateUrl: '/modules/posts/client/views/view-post.client.view.html',
        controller: 'PostsController',
        controllerAs: 'vm',
        resolve: {
          postResolve: getPost
        },
        data: {
          pageTitle: '{{ postResolve.title }}'
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
