/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.contentGeneration')
      .directive('createListsWizard', createListsWizard);

  /** @ngInject */
  function createListsWizard() {
    return {
      restrict: 'E',
      controller: 'CreateListsWizardCtrl',
      templateUrl: 'http://localhost:3000/src/app/pages/contentGeneration/createListsWizard/createListsWizard.html'
    };
  }
})();