(function () {
    'use strict';
    describe('AllocationTableComponent', function () {

        var ctrl;
        var mockDialog;
        var mockAllocationDataService;
        var q;
        var deferred;
        var rootScope;

        beforeEach(angular.mock.module('YJB-Placements'));

        beforeEach(angular.mock.inject(function ($q) {
            q = $q;
            deferred = q.defer();
        }));

        beforeEach(angular.mock.inject(function ($rootScope) {
            rootScope = $rootScope;
        }));

        beforeEach(angular.mock.inject(function ($mdDialog) {
            mockDialog = $mdDialog;
            spyOn(mockDialog, 'show');
        }));

        beforeEach(angular.mock.inject(function (AllocationDataService) {
            mockAllocationDataService = AllocationDataService;
            spyOn(mockAllocationDataService, 'getStaffForFilter');
            spyOn(mockAllocationDataService, 'getYoungPeopleForPlacement');
            spyOn(mockAllocationDataService, 'updateYoungPeopleAfterAllocation');
        }));

      

        beforeEach(angular.mock.inject(function ($componentController) {
            ctrl = $componentController('yjbAllocationDataTableComponent');
        }));

        it('should call the AllocationDataService to getYoungPeopleForPlacement on iniit', function () {
            mockAllocationDataService.getYoungPeopleForPlacement.and.returnValue(deferred.promise);
            ctrl.$onInit();
            expect(mockAllocationDataService.getYoungPeopleForPlacement).toHaveBeenCalled();
        });

        it('should not have null tableParams after fetching data', function(){
            mockAllocationDataService.getYoungPeopleForPlacement.and.returnValue(deferred.promise);
            expect(ctrl.tableParams).toBeNull();
            ctrl.$onInit();
            deferred.resolve(['one', 'two', 'three']);
            rootScope.$apply();
            expect(ctrl.tableParams).not.toBeNull();
        });


        it('should call the AllocationDataService to getStaffForFilter when staffOptions is called', function() {
            ctrl.staffOptions();
            expect(mockAllocationDataService.getStaffForFilter).toHaveBeenCalled();
        });


        it('should call modal dialog when editAllocation is called', function(){
            mockDialog.show.and.returnValue(deferred.promise);
            ctrl.editAllocation();
            expect(mockDialog.show).toHaveBeenCalled();
        });

        it('should return true from filter allocated when display data is null', function() {
            expect(ctrl.filterAllocated()).toBeTruthy();
        });

        it('should return true from filter allocated when display data is All(1)', function() {
            ctrl.displayData = 1;
            expect(ctrl.filterAllocated()).toBeTruthy();
        });

        it('should return true from filter allocated when display data is Allocated(2) and young person is allocated', function() {
            var youngPerson = {
                _allocatedTo: 'test'
            };
            ctrl.displayData = 2;
            expect(ctrl.filterAllocated(youngPerson)).toBeTruthy();
        });

        it('should return false from filter allocated when display data is Allocated(2) and young person is not allocated', function() {
            var youngPerson = {
                _allocatedTo: ''
            };
            ctrl.displayData = 2;
            expect(ctrl.filterAllocated(youngPerson)).toBeFalsy();
        });

    it('should return false from filter allocated when display data is AwaitingAllocatation(3) and young person is allocated', function() {
            var youngPerson = {
                _allocatedTo: 'test'
            };
            ctrl.displayData = 3;
            expect(ctrl.filterAllocated(youngPerson)).toBeFalsy();
        });

        it('should return true from filter allocated when display data is AwaitingAllocatation(3) and young person is not allocated', function() {
            var youngPerson = {
                _allocatedTo: ''
            };
            ctrl.displayData = 3;
            expect(ctrl.filterAllocated(youngPerson)).toBeTruthy();
        });


    })
})();