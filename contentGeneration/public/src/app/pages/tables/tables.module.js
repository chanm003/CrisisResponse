/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.tables', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider, $urlRouterProvider, commonConfigProvider) {
    /*
    $stateProvider
        .state('tables', {
          url: '/tables',
          template : '<ui-view></ui-view>',
          abstract: true,
          controller: 'TablesPageCtrl',
          title: 'Tables',
          sidebarMeta: {
            icon: 'ion-grid',
            order: 300,
          },
        }).state('tables.basic', {
          url: '/basic',
          templateUrl: commonConfigProvider.settings.baseUrl + '/src/app/pages/tables/basic/tables.html',
          title: 'Basic Tables',
          sidebarMeta: {
            order: 0,
          },
        }).state('tables.smart', {
          url: '/smart',
          templateUrl: commonConfigProvider.settings.baseUrl + '/src/app/pages/tables/smart/tables.html',
          title: 'Smart Tables',
          sidebarMeta: {
            order: 100,
          },
        });

    $urlRouterProvider.when('/tables','/tables/basic');
    */
  }

})();
