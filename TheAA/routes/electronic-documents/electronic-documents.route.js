require('angular');

module.exports = angular.module('aah-electronic-documents-route-module', [

    // controllers
    require('./electronic-documents.controller').name,

    require('../search/customer-service-details/customer-service-details-search.controller').name,

    // directives
    require('../../components/summary/summary.directive').name,

    // services
    require('../../services/tab/tab.service').name


]).config(['$stateProvider', '$urlRouterProvider', function ElectronicDocumentsConfig($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('electronic-documents', {
            url: '/electronic-documents',
            views: {
                content_area: {
                    templateUrl: 'partials/electronic-documents.template.html',
                    controller: 'aahElectronicDocumentsController',
                    controllerAs: 'ctrl'
                },
                search: {
                    templateUrl: 'partials/customer-service-details-search.template.html',
                    controller: 'aahCustomerServiceDetailsSearchController',
                    controllerAs: 'ctrl'
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