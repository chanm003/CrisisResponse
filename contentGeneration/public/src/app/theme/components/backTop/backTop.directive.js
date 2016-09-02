/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.theme.components')
      .directive('backTop', backTop);

  /** @ngInject */
  function backTop() {
    return {
      restrict: 'E',
      templateUrl: 'http://localhost:3000/src/app/theme/components/backTop/backTop.html',
      controller: function () {
        $('#backTop').backTop({
          'position': 200,
          'speed': 100
        });
      }
    };
  }

})();