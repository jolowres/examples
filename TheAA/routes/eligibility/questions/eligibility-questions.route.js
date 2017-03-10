require('angular');

module.exports = angular.module('aah-eligibility-questions-route-module', [

    // controllers
    require('./eligibility-questions.controller').name

]).config(['$stateProvider', function EligibilityQuestionsConfig($stateProvider) {

    $stateProvider
        .state('eligibility.questions', {
            url: '/questions',
            views: {
                'eligibility_area': {
                    templateUrl: 'partials/eligibility-questions.template.html',
                    controller: 'aahEligibilityQuestionsController',
                    controllerAs: 'ctrl',
                    bindToController: true
                }
            }
        });
}]);