/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages')
      .directive('switch', switchDirective);

  /** @ngInject */
  function switchDirective($timeout) {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        ngModel: '='
      },
      template: function(el, attrs) {
        return '<div class="switch-container ' + (attrs.color || '') + '"><input type="checkbox" ng-model="ngModel" data-on-text="'+ (attrs.onText || 'ON') +'" data-off-text="'+ (attrs.offText || 'OFF') +'"></div>';
      },
      link: function (scope, elem, attr) {
        $timeout(function(){
          var input = $(elem).find('input');
          input.bootstrapSwitch({
            size: 'small',
            onColor: attr.color
          });
          input.on('switchChange.bootstrapSwitch', function(event, state) {
            scope.ngModel = state;
            scope.$apply();
          });

        });
      }
    };
  }
})();
