var _ = require('lodash');

require('angular');

module.exports = angular.module('aah-eligibility-details-controller-module', [

    // models
    require('../../../models/eligibility-details.factory.js').name,
    require('../../../models/vehicle-query.factory.js').name,
    require('../../../models/entitlement.factory.js').name,

    //constants
    require('../../../constants/eligibility/eligibility-roles.constants.js').name,
    require('../../../constants/alert/alert-type.constants').name,

    //services
    require('../../../services/eligibility/eligibility.service.js').name,
    require('../../../services/search/search.service.js').name,
    require('../../../services/task/task.service').name,
    require('../../../services/entitlement/entitlement-helper.service').name,
    require('../../../services/alert/alert.service').name,

])

.controller('aahEligibilityDetailsController', ['$state', '$stateParams',
    'aahEntitlementsFactory',
    'aahEligibilityDetailsFactory',
    'aahVehicleQueryFactory',
    'aahEligibilityRoles',
    'aahEligibilityService',
    'aahSearchService',
    'aahTaskService',
    'aahEntitlementHelperService',
    'aahAlertService',
    'uibAlertTypes',


    function EligibilityDetailsController($state,
        $stateParams,
        Entitlement,
        EligibilityDetails,
        VehicleQuery,
        eligibilityRoles,
        EligibilityService,
        SearchService,
        TaskService,
        EntitlementHelperService,
        AlertService,
        AlertTypes) {

        var ctrl,
            _vehicleDetails,
            _taskVehicle,
            _roles = [],
            _entitlement;

        ctrl = this;

        _.extend(ctrl, {
            init: function init() {
                EligibilityService.eligibilityDetails().riskCode(EligibilityService.riskCode());
                EligibilityService.eligibilityDetails().customerGroup(EligibilityService.customerGroup());
                EligibilityService.eligibilityDetails().role(eligibilityRoles.MEMBER_ROLE_MAIN_MEMBER);

                _.forEach(eligibilityRoles, function forEachRole(role, idx) {
                    _roles.push(role);
                });
                if ($stateParams.willJoin) {
                    EligibilityService.eligibilityDetails().surname(SearchService.membershipSearchTerm().param().surname());
                }
            },
            eligibilityDetails: function eligibilityDetailsAccessor(val) {
                return arguments.length ? EligibilityService.eligibilityDetails(val)  : EligibilityService.eligibilityDetails();
            },
            vehicleDetails: function vehicleDetails() {
                return _vehicleDetails;
            },
            isPersonalCustomerGroup: function isPersonalCustomerGroup() {
                return EligibilityService.customerGroup().isPersonal();
            },
            isFleetCustomerGroup: function isFleetCustomerGroup() {
                return EligibilityService.customerGroup().isFleet();
            },
            isWillJoin: function isWillJoin() {
                return EligibilityService.eligibilityDetails().isWillJoin();
            },
            roles: function roles(val) {
                return arguments.length ? _roles = val : _roles;
            },
            saveEligibility: function saveEligibility() {
                if (requiredFieldsPopulated()) {
                    EligibilityService.save()
                        .then(function saveEligibilitySuccess(response) {
                            _entitlement = new Entitlement(response.data);
                            if (!$stateParams.newMember) {
                                EntitlementHelperService.findByEntitlement(_entitlement).then(function findByEntitlementSuccess() {
                                    addDetailsToTask();
                                });
                            } else {
                                TaskService.task().entitlement().benefits(_entitlement.benefits());
                                TaskService.task().entitlement().memberDetails(_entitlement.memberDetailsForPrime());
                                addDetailsToTask();
                                $state.go('contact');
                            }
                        }, function saveEligibilityFailure(response) {
                            var errorMessage = 'Problem saving eligibility: ' + response.data.error;
                            AlertService.createAlert(errorMessage, AlertTypes.DANGER);
                        });
                }
            },
            getVehileDetails: function getVehileDetails() {

                SearchService.vehicleSearchTerm().search(EligibilityService.eligibilityDetails().registrationNumber());
                SearchService.vehicleSearch().then(function returnedSearch(data) {
                    _vehicleDetails = data.vehicle.colour() + ' ' + data.vehicle.experianDetails().make() + ' ' + data.vehicle.experianDetails().model();
                    _taskVehicle = data.vehicle;
                    EligibilityService.eligibilityDetails().vehicle(data.vehicle);
                });

            },
            cancelClick: function cancelClick() {
                $state.go('home');
            },
            modelOptions: {
                getterSetter: true
            }

        });

        function requiredFieldsPopulated() {

            if (ctrl.isWillJoin()) {
                EligibilityService.eligibilityDetails().address().postcode(' ');
                return true;
            }

            if (EligibilityService.eligibilityDetails().title() &&
                EligibilityService.eligibilityDetails().forename() &&
                EligibilityService.eligibilityDetails().surname() &&
                EligibilityService.eligibilityDetails().address().addressLines()[0] &&
                EligibilityService.eligibilityDetails().address().postcode()) {
                return true;
            }
            return false;
        }

        function addDetailsToTask() {
            var taskContactName;
            taskContactName = EligibilityService.eligibilityDetails().surname() + ' ' + EligibilityService.eligibilityDetails().title() + ' ' + EligibilityService.eligibilityDetails().forename();
            TaskService.task().contact().name(taskContactName);
            TaskService.task().entitlement().riskCode(EligibilityService.eligibilityDetails().riskCode());
            if (_taskVehicle) {
                TaskService.task().vehicle(_taskVehicle);
            }
            TaskService.save();
        }



    }
]);