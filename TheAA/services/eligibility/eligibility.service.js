var _ = require('lodash');
require('angular');

var CustomerGroup = require('malstrom-models/lib/customer-group.model'),
    EligibilityDetails = require('malstrom-models/lib/eligibility-details.model'),
    SeAahelp = require('malstrom-models/lib/se-aahelp.model');

module.exports = angular.module('aah-eligibility-service-module', [

    // models
    require('../../models/eligibility-question.factory').name,

    // services
    require('../task/task.service').name,
    require('../customer-group/customer-group.service').name,
    require('../../routes/eligibility/questions/eligibility-questions.helper.js').name,

    //constants
    require('../../constants/eligibility/eligibility-urls.constants').name

]).service('aahEligibilityService', ['$http', 'aahEligibilityURLs', 'aahTaskService', 'aahCustomerGroupService', 'aahEligibilityQuestionFactory',  'aahEligibilityQuestionsHelper',
    function EligibilityService($http, eligibilityUrls, TaskService, CustomerGroupService, EligibilityQuestionFactory, eligibilityQuestionsHelper) {

        var svc = this,
            _questions = [],
            _riskCode,
            _customerGroup,
            _validCustomer,
            _eligibilityDetails,
            _tempNameStorageForNewMember = {};

        _validCustomer = false;

        _.extend(svc, {
            reset : function() {
                eligibilityQuestionsHelper.reset();
                _riskCode = null;
                _questions = [];
                _tempNameStorageForNewMember = {};
            },
            willJoin: function willJoin() {
                // make copy of CG -- but I am not sure that we need this any more ... 
                _customerGroup = new CustomerGroup(CustomerGroupService.findCustomerGroupByCode('PERS').toJSON());
                _riskCode = EligibilityDetails.WILL_JOIN;
                // request will join task to set up ui
                return TaskService.willJoin('PERS', 'RSS');
            },
            loadAndCacheEligibilityQuestions: function loadAndCacheEligibilityQuestions() {
                return $http.get(eligibilityUrls.ELIGIBILITY_QUESTIONS + "?customerGroupCode=" + _customerGroup.code())
                    .then(function (response) {

                        _.forEach(response.data, function forEachQuestionInResponse(question, idx) {

                            _questions.push(new EligibilityQuestionFactory(question));
                        });

                        return _questions;
                    });
            },

            eligibilityQuestions: function eligibilityQuestionsAcessor() {
                return _questions;
            },

            getStartQuestion: function getStartQuestion() {

                var startingQuestion,
                    i;

                _.forEach(_questions, function findStartingQuestionInCachedQuestion(question, idx) {
                    if (question.startingQuestion()) {
                        startingQuestion = question;
                    }
                });

                return startingQuestion;

            },
            getQuestionById: function getQuestionById(questionId) {

                var requestedQuestion,
                    i;

                _.forEach(_questions, function findStartingQuestionInCachedQuestion(question, idx) {
                    if (question.questionId() === questionId) {
                        requestedQuestion = question;
                    }
                });

                return requestedQuestion;

            },
            validCustomer: function validCustomerAccessor(val) {
                return arguments.length ? _validCustomer = val : _validCustomer;
            },
            save: function save() {
                _tempNameStorageForNewMember.title = _eligibilityDetails.title();
                _tempNameStorageForNewMember.forename = _eligibilityDetails.forename();
                _tempNameStorageForNewMember.surname = _eligibilityDetails.surname();
                return $http.post(eligibilityUrls.ELIGIBILITY_DETAILS, {
                    eligibilityDetails: _eligibilityDetails
                });
            },
            customerGroup: function customerGroupAccessor(val) {
                return arguments.length ? _customerGroup = val : _customerGroup;
            },
            riskCode: function riskCodeAccessor(val) {
                return arguments.length ? _riskCode = val : _riskCode;
            },
            isWillJoin: function () {
                return _riskCode === EligibilityDetails.WILL_JOIN;
            },
            getSeAahelp: function getSeAahelp(contractKey) {
                return $http.get(eligibilityUrls.SE_AAHELP.replace(':contractKey', contractKey))
                    .then(function getSeAaHelpSuccess(response) {
                        return new SeAahelp(response.data[0]);
                    });
            },
            eligibilityDetails: function eligibilityDetailsAccessor(val) {
                return arguments.length ? _eligibilityDetails = val : _eligibilityDetails;
            },
            resetEligibilityDetails: function resetEligibilityDetails() {
                _eligibilityDetails = new EligibilityDetails();
            },
            newMember: function newMember(customerGroup, registrationNumber) {
                _riskCode = 'NM';
                _customerGroup = customerGroup;
                _eligibilityDetails.registrationNumber(registrationNumber);
                _eligibilityDetails.surname(_tempNameStorageForNewMember.surname);
                _eligibilityDetails.forename(_tempNameStorageForNewMember.forename);
                _eligibilityDetails.title(_tempNameStorageForNewMember.title);
            }
        });
    }
]);