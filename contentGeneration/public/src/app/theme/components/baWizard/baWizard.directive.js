(function() {
  'use strict';

  angular.module('BlurAdmin.theme.components')
    .directive('baWizard', baWizard);

  /** @ngInject */
  function baWizard(commonConfigProvider) {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: commonConfigProvider.settings.baseUrl + '/src/app/theme/components/baWizard/baWizard.html',
      controllerAs: '$baWizardController',
      controller: 'baWizardCtrl'
    }
  }
})();
