/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.dashboard')
      .directive('dashboardCalendar', dashboardCalendar);

  /** @ngInject */
  function dashboardCalendar(commonConfig) {
    return {
      restrict: 'E',
      controller: 'DashboardCalendarCtrl',
      templateUrl: commonConfig.settings.baseUrl + '/src/app/pages/dashboard/dashboardCalendar/dashboardCalendar.html'
    };
  }
})();