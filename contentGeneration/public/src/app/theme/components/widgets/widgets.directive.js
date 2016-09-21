/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.theme.components')
      .directive('widgets', widgets);

  /** @ngInject */
  function widgets(commonConfig) {
    return {
      restrict: 'EA',
      scope: {
        ngModel: '='
      },
      templateUrl: commonConfig.settings.baseUrl + '/src/app/theme/components/widgets/widgets.html',
      replace: true
    };
  }

})();