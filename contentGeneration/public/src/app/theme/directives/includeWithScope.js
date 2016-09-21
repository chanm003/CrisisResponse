/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.theme')
      .directive('includeWithScope', includeWithScope);

  /** @ngInject */
  function includeWithScope(commonConfig) {
    return {
      restrict: 'AE',
      templateUrl: function(ele, attrs) {
        return commonConfig.settings.baseUrl + "/src/" + attrs.includeWithScope;
      }
    };
  }

})();
