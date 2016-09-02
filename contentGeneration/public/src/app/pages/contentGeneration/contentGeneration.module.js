/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.contentGeneration', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('generation', {
          url: '/generation',
          templateUrl: 'http://localhost:3000/src/app/pages/contentGeneration/contentGeneration.html',
          title: 'Content Generation',
          sidebarMeta: {
            icon: 'ion-android-home',
            order: 10,
          },
        });
  }

})();
