(function() {
  'use strict';

  angular.module('BlurAdmin.theme.components')
    .controller('baWizardCtrl', baWizardCtrl);

  /** @ngInject */
  function baWizardCtrl($scope, common) {
    var vm = this;
    vm.tabs = [];

    vm.tabNum = 0;
    vm.progress = 0;

    vm.addTab = function(tab) {
      tab.setPrev(vm.tabs[vm.tabs.length - 1]);
      vm.tabs.push(tab);
      vm.selectTab(0);
    };

    //$scope.$watch(angular.bind(vm, function () {return vm.tabNum;}), calcProgress);

    vm.selectTab = function (tabNum) {
      if(tabNum === 0){
        //always OK to go to first tab
        updateTabIndex(tabNum);
        return;
      }

      var busyModal = common.showBusyModal();
      vm.tabs[vm.tabNum].submit()
        .then(function(data){
          updateTabIndex(tabNum);
        })
        .finally(function(err){
          busyModal.close();
        });

        function updateTabIndex(tabNum){
          vm.tabNum = tabNum;
          vm.tabs.forEach(function (t, tIndex) {
            tIndex == vm.tabNum ? t.select(true) : t.select(false);
          });
          calcProgress();
        }
    };

    vm.isFirstTab = function () {
      return vm.tabNum == 0;
    };

    vm.isLastTab = function () {
      return vm.tabNum == vm.tabs.length - 1 ;
    };

    vm.nextTab = function () {
      vm.selectTab(vm.tabNum + 1)
    };

    vm.previousTab = function () {
      vm.selectTab(vm.tabNum - 1)
    };

    function calcProgress() {
      vm.progress = ((vm.tabNum + 1) / vm.tabs.length) * 100;
    }
  }
})();

