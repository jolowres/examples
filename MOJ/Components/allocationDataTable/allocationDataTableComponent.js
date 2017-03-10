(function () {
    'use strict';

    var appModule = angular.module('YJB-Placements');
    var bindings = {};
    var allocationTableComponent = {
        bindings: bindings,
        controller: ComponentController,
        controllerAs: 'ctrl',
        templateUrl: TemplateUrl
    };

    appModule
        .component('yjbAllocationDataTableComponent', allocationTableComponent);

    TemplateUrl.$inject = ['HTMLBaseUrl'];
    function TemplateUrl(HTMLBaseUrl) {
        return HTMLBaseUrl + 'components/allocationDataTable/allocationDataTable.html';
    }

    ComponentController.$inject = [
        '$mdDialog',
        'AllocationDataService',
        'HTMLBaseUrl',
        'NgTableParams',
        'SharedBaseUrl',
        'SHARED_CONSTANTS',
        'PLACEMENT_CONTENT'
    ];

    function ComponentController(
        $mdDialog,
        AllocationDataService,
        HTMLBaseUrl,
        NgTableParams,
        SharedBaseUrl,
        SHARED_CONSTANTS,
        PLACEMENT_CONTENT
    ) {

        var ctrl = this;

        //properties
        ctrl.tableParams = null;
        ctrl.displayData = null;
        ctrl.AllocationSelection = SHARED_CONSTANTS.AllocationSelection;

        //methods
        ctrl.editAllocation = editAllocation;
        ctrl.staffOptions = staffOptions;
        ctrl.filterAllocated = filterAllocated;

        //lifecycle methods
        ctrl.$onInit = init;
        function init() {
            AllocationDataService.getYoungPeopleForPlacement()
                .then(function getYoungPeopleForPlacementSuccess() {
                    ctrl.tableParams = new NgTableParams({}, { dataset: AllocationDataService.youngPeople() });
                });
        }

        //methods
        function filterAllocated(youngPerson) {
            if(!ctrl.displayData ||
               parseInt(ctrl.displayData) === SHARED_CONSTANTS.AllocationSelection.All ) {
                   return true;
               }

            else if (ctrl.displayData &&
                parseInt(ctrl.displayData) === SHARED_CONSTANTS.AllocationSelection.Allocated && 
                youngPerson._allocatedTo) {
                return true;
            } 
            else if (ctrl.displayData &&
                parseInt(ctrl.displayData) === SHARED_CONSTANTS.AllocationSelection.AwaitingAllocation && 
                !youngPerson._allocatedTo) {
                return true;
            }
            return false;
        }

        function editAllocation(event, youngPerson) {
            //set up dialog
            var confirm = $mdDialog.confirm({
                controller: 'EditAllocationDialogController',
                controllerAs: 'ctrl',
                templateUrl: SharedBaseUrl + 'app/pages/editAllocationDialog/editAllocationDialog.html',
                targetEvent: event,
                clickOutsideToClose: true,
                locals: {
                    youngPerson: youngPerson,
                    source: SHARED_CONSTANTS.AllocationSource.Placement
                }
            });

            //show dialog
            $mdDialog.show(confirm)
                .then(function youngPersonAllocated(updatedYoungPerson) {
                    //after ok clicked
                    AllocationDataService.updateYoungPeopleAfterAllocation(updatedYoungPerson);
                    ctrl.tableParams = new NgTableParams({}, { dataset: AllocationDataService.youngPeople() });
                }, function documentEditCancel() {
                    //do nothing on cancel
                });
        }

        function staffOptions() {
           return AllocationDataService.getStaffForFilter(PLACEMENT_CONTENT.Allocation.UserGroup);
        }
    }
})();