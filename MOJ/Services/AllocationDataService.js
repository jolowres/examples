(function () {
    'use strict';

    angular
        .module('YJB-Shared')
        .service('AllocationDataService', allocationDataService);

    allocationDataService.$inject = [
        'AllocationService',
        'RolesService',
        'YoungPersonService',
        'SHARED_CONSTANTS'];

    function allocationDataService(
        AllocationService,
        RolesService,
        YoungPersonService,
        SHARED_CONSTANTS) {

        var svc = this;
        var _youngPeople;

        //interface
        svc.getStaffForAllocationList = getStaffForAllocationList;
        svc.getYoungPeopleForPlacement = getYoungPeopleForPlacement;
        svc.getStaffForFilter = getStaffForFilter;
        svc.getYoungPeopleForSecureEstate = getYoungPeopleForSecureEstate;
        svc.allocateStaff = allocateStaff;
        svc.youngPeople = youngPeople;
        svc.updateYoungPeopleAfterAllocation = updateYoungPeopleAfterAllocation;

        //methods
        function updateYoungPeopleAfterAllocation(updatedYoungPerson) {
            var indexOfYp = _.findIndex(_youngPeople, function (youngPerson) {
                return youngPerson.id === updatedYoungPerson.id;
            });
            _youngPeople[indexOfYp] = updatedYoungPerson;
        }

        function youngPeople(val) {
            if (arguments.length) {
                _youngPeople = val;
            } else {
                //decorate the young person object
                _.forEach(_youngPeople, function forEachYoungPerson(youngPerson) {
                    var viewers = [];
                    var allocator;

                    allocator = _.find(youngPerson.ypUserAllocations, function findAllocated(allocation) {
                        return allocation.allocRole === SHARED_CONSTANTS.AllocationRoles.Allocator;
                    });


                    _.forEach(youngPerson.ypUserAllocations, function forEachAllocation(allocation) {
                        if (allocation.allocRole === SHARED_CONSTANTS.AllocationRoles.Viewer) {
                            viewers.push(allocation.username);
                        }
                    });

                    //add properties to model for table
                    youngPerson._allocatedTo = allocator ? allocator.username : '';
                    youngPerson._viewers = viewers ? viewers.join('; ') : '';
                });
                return _youngPeople;
            }
        }

        function allocateStaff(allocationSource, youngPerson, allocationList, viewersList) {

            youngPerson.ypUserAllocations = [];
            _.forEach(allocationList, function forEachAllocated(staffMember) {
                if (staffMember.selected) {
                    youngPerson.ypUserAllocations.push({
                        username: staffMember.username,
                        allocRole: SHARED_CONSTANTS.AllocationRoles.Allocator,
                        id: staffMember.id
                    });
                }
            });

            _.forEach(viewersList, function forEachViewer(viewer) {
                if (viewer.selected) {
                    youngPerson.ypUserAllocations.push({
                        username: viewer.username,
                        allocRole: SHARED_CONSTANTS.AllocationRoles.Viewer,
                        id: viewer.id
                    });
                }
            });

            return YoungPersonService.allocateStaff(
                {
                    youngPersonId: youngPerson.id,
                    'alloc-source': allocationSource
                }, youngPerson.ypUserAllocations)
                .$promise
                .then(function youngPersonAllocationSuccessful(ypUserAllocations) {
                    //return ypAllocation object that includes ids
                    return ypUserAllocations;
                });

        }

        function getStaffForAllocationList(group) {
            var searchGroup = group ? group : RolesService.group();
            return AllocationService.getStaff({ groupName: searchGroup })
                .$promise
                .then(function getStaffSuccess(staff) {
                    var staffList = [];
                    _.forEach(staff, function forEachStaffMember(staffMember) {
                        staffList.push({
                            username: staffMember.userName,
                            displayName: staffMember.displayName,
                            selected: false,
                            id: null
                        });
                    });
                    return staffList;
                });
        }


        function getStaffForFilter(group) {
            var searchGroup = group ? group : RolesService.group();
            return AllocationService.getStaff({ groupName: searchGroup })
                .$promise
                .then(function getStaffSuccess(data) {
                    var staff = [];
                    _.forEach(data, function forEachStaffMember(staffMember) {
                        staff.push({
                            id: staffMember.userName,
                            title: staffMember.userName
                        });
                    });
                    return staff;
                });
        }

        function getYoungPeopleForSecureEstate() {
            return YoungPersonService.getYoungPeopleForSecureEstate(
                { secureEstateCode: RolesService.getEstablishments()[0] })
                .$promise
                .then(function getYoungPeopleForSecureEstateSuccess(youngPeople) {
                    _youngPeople = youngPeople;
                });

        }

        function getYoungPeopleForPlacement() {
            return YoungPersonService.getYoungPeopleForPlacement()
                .$promise
                .then(function getYoungPeopleForPlacementSuccess(youngPeople) {
                    _youngPeople = youngPeople;
                });
        }

    }
})();