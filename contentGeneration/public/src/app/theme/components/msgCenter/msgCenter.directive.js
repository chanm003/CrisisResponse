/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.theme.components')
      .directive('msgCenter', msgCenter);

  /** @ngInject */
  function msgCenter() {
    return {
      restrict: 'E',
      templateUrl: 'http://localhost:3000/src/app/theme/components/msgCenter/msgCenter.html',
      controller: 'MsgCenterCtrl'
    };
  }

})();