require('angular');

module.exports = angular.module('aah-eligibility-details-route-module', [
    // controllers
    require('./eligibility-details.controller').name,
    require('../../../components/dg-validation/dg-validation.js'),


]).config(['$stateProvider', function EligibilityDetailsConfig($stateProvider) {

    $stateProvider
        .state('eligibility.details', {
            url: '/details',
            views: {
                'eligibility_area': {
                    templateUrl: 'partials/eligibility-details.template.html',
                    controller: 'aahEligibilityDetailsController',
                    controllerAs: 'ctrl',
                    bindToController: true
                }
            },
            params: {
                willJoin: false,
                newMember: false
            }
        });
}]);