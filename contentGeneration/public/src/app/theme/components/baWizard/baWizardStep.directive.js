(function() {
  'use strict';

  angular.module('BlurAdmin.theme.components')
    .directive('baWizardStep', baWizardStep);

  /** @ngInject */
  function baWizardStep($q, $timeout, commonConfig) {
    return {
      restrict: 'E',
      transclude: true,
      require: '^baWizard',
      scope: {
        onNextStepClicked: '&'
      },
      templateUrl: commonConfig.settings.baseUrl + '/src/app/theme/components/baWizard/baWizardStep.html',
      link: function($scope, $element, $attrs, wizard) {
        $scope.selected = true;

        var tab = {
          title: $attrs.title,
          select: select,
          submit: submit,
          prevTab: undefined,
          setPrev: setPrev
        };

        wizard.addTab(tab);

        function select(isSelected) {
          if (isSelected) {
            $scope.selected = true;
          } else {
            $scope.selected = false;
          }
        }

        function submit() {
          return $scope.onNextStepClicked();
        }

        function setPrev(pTab) {
          tab.prevTab = pTab;
        }
      }
    };
  }
})();