var _ = require('lodash');
require('angular');

module.exports = angular.module('aah-eligibility-controller-module', [
    require('./questions/eligibility-questions.route').name
]).controller('aahEligibilityController', ['$state',
    function EligibilityController($state) {

        var ctrl;

        ctrl = this;

        _.extend(ctrl, {
            subStates: [{
                friendly: 'Questions',
                state: 'eligibility.questions'
            }, {
                friendly: 'Details',
                state: 'eligibility.details'
            }]
        });

    }
]);