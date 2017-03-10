(function () {
    'use strict';
    describe('AllocationDataService tests', function () {

        var svc;
        var q;
        var deferred;
        var rootScope;
        var mockAllocationService;
        var mockRolesService;
        var mockYoungPersonService

        beforeEach(module('YJB-Shared'));

        beforeEach(angular.mock.inject(function ($q) {
            q = $q;
            deferred = q.defer();
        }));

        beforeEach(angular.mock.inject(function ($rootScope) {
            rootScope = $rootScope;
        }));

        beforeEach(angular.mock.inject(function (AllocationService) {
            mockAllocationService = AllocationService;
            spyOn(mockAllocationService, 'getStaff');
        }));

        beforeEach(angular.mock.inject(function (RolesService) {
            mockRolesService = RolesService;
            spyOn(mockRolesService, 'group');
            spyOn(mockRolesService, 'getEstablishments');
        }));

        beforeEach(angular.mock.inject(function (YoungPersonService) {
            mockYoungPersonService = YoungPersonService;
            spyOn(mockYoungPersonService, 'allocateStaff');
            spyOn(mockYoungPersonService, 'getYoungPeopleForSecureEstate');
        }));

        beforeEach(inject(function (AllocationDataService) {
            svc = AllocationDataService;
        }));

        it('should call the young person service getYoungPeopleForSecureEstate when getYoungPeopleForSecureEstate is called', function () {
            mockRolesService.getEstablishments.and.returnValue(['TEST']);
            mockYoungPersonService.getYoungPeopleForSecureEstate.and.callFake(function (callback) {
                deferred.promise.then(callback);
                return { $promise: deferred.promise };
            });
            svc.getYoungPeopleForSecureEstate();
            expect(mockYoungPersonService.getYoungPeopleForSecureEstate).toHaveBeenCalledWith({ secureEstateCode: 'TEST' });
        });

        it('should return decorated youngPeople via the accessor when the getYoungPeopleForSecureEstate resolves', function () {
            mockRolesService.getEstablishments.and.returnValue(['TEST']);
            mockYoungPersonService.getYoungPeopleForSecureEstate.and.callFake(function (callback) {
                deferred.promise.then(callback);
                return { $promise: deferred.promise };
            });
            svc.getYoungPeopleForSecureEstate();
            deferred.resolve([{
                ypUserAllocations: [{
                    allocRole: 'ALLOCATED',
                    username: 'Allocated user',
                }, {
                    allocRole: 'VIEWER',
                    username: 'viewer 1'
                }, {
                    allocRole: 'VIEWER',
                    username: 'viewer 2'
                }]
            }]);
            rootScope.$apply();
            expect(svc.youngPeople()[0]._allocatedTo).toBe('Allocated user');
            expect(svc.youngPeople()[0]._viewers).toBe('viewer 1; viewer 2');
        });

        it('should call the YoungPersonService.allocateStaff when allocateStaff is called', function () {
            var youngPerson = {
                id: 9999,
                ypUserAllocations: []
            };
            var allocationList = [{
                username: 'allocated',
                selected: true,
                id: 77
            }, {
                username: 'not allocated',
                selected: false,
                id: null
            }];
            var viewerList = [{
                username: 'not viewer',
                selected: false,
                id: 77
            }, {
                username: 'viewer',
                selected: true,
                id: 33
            }];
            mockYoungPersonService.allocateStaff.and.callFake(function (callback) {
                deferred.promise.then(callback);
                return { $promise: deferred.promise };
            });
            svc.allocateStaff('ESTABLISHMENT', youngPerson, allocationList, viewerList);
            expect(mockYoungPersonService.allocateStaff).toHaveBeenCalledWith(
                {
                    youngPersonId: 9999,
                    "alloc-source": 'ESTABLISHMENT'
                }, [
                    {
                        username: 'allocated',
                        allocRole: 'ALLOCATED',
                        id: 77
                    },
                    {
                        username: 'viewer',
                        allocRole: 'VIEWER',
                        id: 33
                    }
                ]
            );
        });

        it('should call the AllocationService.getStaff when getStaffForAllocationList is called using group from Roles Service if no parmeter passed in', function(){
            mockRolesService.group.and.returnValue('TEST');
            mockAllocationService.getStaff.and.callFake(function (callback) {
                deferred.promise.then(callback);
                return { $promise: deferred.promise };
            });
            svc.getStaffForAllocationList();
            expect(mockAllocationService.getStaff).toHaveBeenCalledWith({groupName: 'TEST'});
        });

        it('should call the AllocationService.getStaff when getStaffForAllocationList is called using group parmeter passed in', function(){
            mockAllocationService.getStaff.and.callFake(function (callback) {
                deferred.promise.then(callback);
                return { $promise: deferred.promise };
            });
            svc.getStaffForAllocationList('GROUP');
            expect(mockAllocationService.getStaff).toHaveBeenCalledWith({groupName: 'GROUP'});
        });

        it('should return formatted staff list when getStaffForAllocationList resolves', function(){
            var result;
            mockAllocationService.getStaff.and.callFake(function (callback) {
                deferred.promise.then(callback);
                return { $promise: deferred.promise };
            });
            svc.getStaffForAllocationList().then(function(data) {
                result = data;
            });
            deferred.resolve([{
                userName: 'userName',
                displayName: 'displayName'
            }]);
            rootScope.$apply();
            expect(result[0].username).toEqual('userName');
            expect(result[0].displayName).toEqual('displayName');
            expect(result[0].selected).toEqual(false);
            expect(result[0].id).toEqual(null);
        });

        it('should call the AllocationService.getStaff when getStaffForFilter is called using roles service if no group passed in', function(){
            mockRolesService.group.and.returnValue('TEST');
            mockAllocationService.getStaff.and.callFake(function (callback) {
                deferred.promise.then(callback);
                return { $promise: deferred.promise };
            });
            svc.getStaffForFilter();
            expect(mockAllocationService.getStaff).toHaveBeenCalledWith({groupName: 'TEST'});
        });

        it('should call the AllocationService.getStaff when getStaffForFilter is called using group passed in', function(){
            mockAllocationService.getStaff.and.callFake(function (callback) {
                deferred.promise.then(callback);
                return { $promise: deferred.promise };
            }); 
            svc.getStaffForFilter('GROUP');
            expect(mockAllocationService.getStaff).toHaveBeenCalledWith({groupName: 'GROUP'});
        });

        it('should return formatted staff list when getStaffForFilter resolves', function(){
            var result;
            mockAllocationService.getStaff.and.callFake(function (callback) {
                deferred.promise.then(callback);
                return { $promise: deferred.promise };
            });
            svc.getStaffForFilter().then(function(data) {
                result = data;
            });
            deferred.resolve([{
                userName: 'userName',
            }]);
            rootScope.$apply();
            expect(result[0].id).toEqual('userName');
            expect(result[0].title).toEqual('userName');
        });
    })
})();