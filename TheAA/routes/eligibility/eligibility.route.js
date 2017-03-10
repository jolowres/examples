require('angular');

module.exports = angular.module('aah-eligibility-route-module', [

    // controllers
    require('./eligibility.controller').name,

    // child states
    require('./questions/eligibility-questions.route').name,
    require('./details/eligibility-details.route').name

]).config(['$stateProvider', '$urlRouterProvider', function EligibilityConfig($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when("/eligibility", "/eligibility/questions");
    $urlRouterProvider.when("/eligibility/", "/eligibility/questions");

    $stateProvider
        .state('eligibility', {
            url: '/eligibility',
            views: {
                content_area: {
                    templateUrl: 'partials/eligibility.template.html',
                    controller: 'aahEligibilityController',
                    controllerAs: 'ctrl'
                },
                search: {
                    templateUrl: 'partials/membership-search.template.html',
                    controller: 'aahMembershipSearchController',
                    controllerAs: 'ctrl',
                    resolve: {
                        customerGroups: ['aahCustomerGroupService', function (CustomerGroupService) {
                            return CustomerGroupService.loadCustomerGroups();
                        }]
                    }
                },
                tabs: {
                    templateUrl: 'partials/tabs.template.html',
                    controller: 'aahTabsController',
                    controllerAs: 'ctrl',
                    resolve: {
                        tabs: ['aahTabService', function TabResolve(TabService) {
                            return TabService.getTabs();
                        }]
                    }
                },
                summary: {
                    templateUrl: 'partials/summary-view.template.html',
                    controller: 'aahSummaryViewController',
                    controllerAs: 'ctrl'
                },
                footer: {
                    templateUrl: 'partials/footer.template.html',
                    controller: 'aahFooterController',
                    controllerAs: 'ctrl'
                },
                status: {
                    templateUrl: 'partials/status.template.html',
                    controller: 'aahStatusController',
                    controllerAs: 'ctrl'
                }
            }
        });
}]);