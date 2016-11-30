/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.dashboard', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider, commonConfigProvider) {
    $stateProvider
        .state('dashboard', {
          url: '/dashboard',
          templateUrl: commonConfigProvider.settings.baseUrl + '/src/app/pages/dashboard/dashboard.html',
          controller: 'DashboardCtrl',
          controllerAs: 'vm',
          title: 'Dashboard',
          sidebarMeta: {
            icon: 'ion-android-home',
            order: 10,
          },
        });
  }

})();
