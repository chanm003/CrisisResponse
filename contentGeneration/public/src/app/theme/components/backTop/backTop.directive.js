/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.theme.components')
      .directive('backTop', backTop);

  /** @ngInject */
  function backTop(commonConfig) {
    return {
      restrict: 'E',
      templateUrl: commonConfig.settings.baseUrl + '/src/app/theme/components/backTop/backTop.html',
      controller: function () {
        $('#backTop').backTop({
          'position': 200,
          'speed': 100
        });
      }
    };
  }

})();