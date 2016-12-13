(function () {
    'use strict';

    angular.module('BlurAdmin.pages.dashboard')
        .controller('DashboardCtrl', DashboardCtrl)
        .controller('ConfirmDeleteSharepointGroupCtrl', ConfirmDeleteSharepointGroupCtrl);

    /** @ngInject */
    function DashboardCtrl($q, $scope, $uibModal, common, commonConfig, sharepointUtilities) {
        var vm = this;

        refreshData();

        function refreshData(){
            return sharepointUtilities.getSharepointGroups({ keyword: 'EXCON' }).then(function (data) {
                vm.spGroups = data;
                return data;
            });
        }

        function deleteSharePointGroup(group){
            return sharepointUtilities.deleteSharepointGroup({webUrl: _spPageContextInfo.webServerRelativeUrl, groupID: group.Id});
        }

        vm.goToGroupMembersPage = function (group) {
            var url = '/_layouts/15/people.aspx?MembershipGroupId=' + group.Id;
            window.open(url, '_blank');
        }

        vm.goToGroupPermissionsPage = function (group) {
            var url = '/_layouts/15/ViewGroupPermissions.aspx?ID=' + group.Id;
            window.open(url, '_blank');
        }

        vm.goToGroupSettingsPage = function (group) {
            var url = '/_layouts/15/editgrp.aspx?Group=' + group.Title;
            window.open(url, '_blank');
        }

        vm.openConfirmDeleteModal = function (group) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: commonConfig.settings.baseUrl + '/src/app/pages/dashboard/widgets/confirmDelete-sharepointGroup.html',
                size: 'sm',
                controller: 'ConfirmDeleteSharepointGroupCtrl',
                controllerAs: 'vm',
                resolve: {
                    selectedGroup: function () {
                        return group;
                    }
                }
            });

            modalInstance.result
                .then(deleteSharePointGroup)
                .then(refreshData);
        }
    }

     function ConfirmDeleteSharepointGroupCtrl($q, $scope, $uibModalInstance, common, commonConfig, sharepointUtilities, selectedGroup) {
        var vm = this;
        vm.selectedGroup = selectedGroup;

        vm.onConfirmClicked = function(){
            $uibModalInstance.close(vm.selectedGroup);
        };
     }
})();