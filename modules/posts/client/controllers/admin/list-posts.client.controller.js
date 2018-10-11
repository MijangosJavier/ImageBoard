(function () {
  'use strict';

  angular
    .module('posts.admin')
    .controller('PostsAdminListController', PostsAdminListController);

  PostsAdminListController.$inject = ['PostsService'];

  function PostsAdminListController(PostsService) {
    var vm = this;

    vm.posts = PostsService.query();
  }
}());
