/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.contentGeneration')
      .directive('createListsWizard', createListsWizard);

  /** @ngInject */
  function createListsWizard(commonConfig) {
    return {
      restrict: 'E',
      controller: 'CreateListsWizardCtrl',
      templateUrl: commonConfig.settings.baseUrl + '/src/app/pages/contentGeneration/createListsWizard/createListsWizard.html'
    };
  }
})();