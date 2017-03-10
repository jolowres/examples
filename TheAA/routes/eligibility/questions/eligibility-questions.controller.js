var _ = require('lodash'),
    formly = require('angular-formly'),
    formlyBootstrap = require('angular-formly-templates-bootstrap'),
    MembershipSearchTerm = require('malstrom-models/lib/membership-query.model'),
    AdvancedSearchParams = require('malstrom-models/lib/advanced-membership-query.model');

require('angular');
require('angular-hotkeys');

module.exports = angular.module('aah-eligibility-questions-controller-module', [formly, formlyBootstrap,
    'cfp.hotkeys',
    require('../../../services/eligibility/eligibility.service.js').name,
    require('../../../services/task/task.service.js').name,
    require('./eligibility-questions.helper.js').name,
    require('../../../services/search/search.service').name,
    require('../../../services/alert/alert.service').name,
    require('../../../services/customer-group/customer-group.service').name,
    require('../../../constants/alert/alert-type.constants').name,
    require('../../../constants/error/error.constants').name

]).controller('aahEligibilityQuestionsController', [
    '$scope',
    '$state',
    'hotkeys',
    'aahEligibilityService',
    'aahEligibilityQuestionsHelper',
    'aahTaskService',
    'aahSearchService',
    'aahAlertService',
    'aahCustomerGroupService',
    'uibAlertTypes',
    'aahErrorConstants',
    function EligibilityQuestionsController(
        $scope,
        $state,
        hotkeys,
        EligibilityService,
        eligibilityQuestionsHelper,
        TaskService,
        SearchService,
        AlertService,
        CustomerGroupService,
        AlertTypes,
        Errors) {

        var ctrl = this,
            _eligibilityQuestionFieldDefinition = [],
            _questionsAsked = [],
            _model,
            _showOutcome = false,
            _eligible = false,
            _outcome = '',
            _outcomeInfoUrl = '',
            _answeredQuestions = [],
            _riskCode = '',
            _accountNo = '',
            _bcaspNo = '';

        hotkeys.bindTo($scope).add({
            combo: 'alt+shift+c',
            description: 'Cancel',
            allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
            callback: function () {
                ctrl.cancelClick();
            }
        }).add({
            combo: 'alt+b',
            description: 'Back',
            allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
            callback: function () {
                ctrl.backClick();
            }
        }).add({
            combo: 'alt+shift+u',
            description: 'Continue',
            allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
            callback: function () {
                ctrl.continueClick();
            }
        });

        loadEligibilityQuestionsAndSetStartQuestion();
        setWatches();


        function loadEligibilityQuestionsAndSetStartQuestion() {

            var startQuestion;

            EligibilityService.loadAndCacheEligibilityQuestions().then(function questionsLoaded() {
                startQuestion = EligibilityService.getStartQuestion();
                setUpFormFieldDefinitionForQuestion(startQuestion);
                _questionsAsked.push(startQuestion);
            });
        }

        function setWatches() {
            //watching a function to see if the answer has changed because someone has clicked on an answer
            $scope.$watch(eligibilityQuestionsHelper.answerValue, function () {

                if (eligibilityQuestionsHelper.answerValue()) {
                    processAnswer(eligibilityQuestionsHelper.answerValue());
                }

            });
        }

        function setUpFormFieldDefinitionForQuestion(question) {

            _eligibilityQuestionFieldDefinition = eligibilityQuestionsHelper.createSelectionFieldDefinition(question);
            eligibilityQuestionsHelper.currentQuestion(question);
        }

        function processAnswer(answerId) {

            var currentAnswer;

            currentAnswer = eligibilityQuestionsHelper.getAnswer(answerId);

            eligibilityQuestionsHelper.currentQuestion().selectedAnswer(currentAnswer);

            _answeredQuestions.push(eligibilityQuestionsHelper.currentQuestion());

            if (currentAnswer.nextQuestionId()) {
                getAndDisplayNextQuestion(currentAnswer);
            }
            if (currentAnswer.outcomeText()) {
                showOutcome(currentAnswer);
            }
            if (currentAnswer.eligible()) {
                _riskCode = currentAnswer.riskCode();
                _accountNo = currentAnswer.accountNo();
                _bcaspNo = currentAnswer.bcaspNo();
            }

        }

        function getAndDisplayNextQuestion(answer) {
            var nextQuestion;
            nextQuestion = EligibilityService.getQuestionById(answer.nextQuestionId());
            setUpFormFieldDefinitionForQuestion(nextQuestion);
            _questionsAsked.push(nextQuestion);
        }

        function showOutcome(answer) {
            _questionsAsked.push('all questions asked');
            _showOutcome = true;
            _outcome = answer.outcomeText();
            _outcomeInfoUrl = answer.outcomeInfoUrl();
            _eligible = answer.eligible();
        }

        _.extend(ctrl, {
            model: _model,
            eligibilityQuestionFieldDefinition: function eligibilityQuestionFieldDefinitionAccessor(val) {
                return arguments.length ? _eligibilityQuestionFieldDefinition = val : _eligibilityQuestionFieldDefinition;
            },
            showOutcome: function showOutcomeAccessor(val) {
                return arguments.length ? _showOutcome = val : _showOutcome;
            },
            eligible: function eligibleAccessor(val) {
                return arguments.length ? _eligible = val : _eligible;
            },
            outcome: function outcomeAccessor(val) {
                return arguments.length ? _outcome = val : _outcome;
            },
            outcomeInfoUrl: function outcomeInfoAccessor(val) {
                return arguments.length ? _outcomeInfoUrl = val : _outcomeInfoUrl;
            },
            riskCode: function riskCodeAccessor(val) {
                return arguments.length ? _riskCode = val : _riskCode;
            },
            accountNo: function accountNoAccessor(val) {
                return arguments.length ? _accountNo = val : _accountNo;
            },
            bcaspNo: function bcaspNoAccessor(val) {
                return arguments.length ? _bcaspNo = val : _bcaspNo;
            },
            customerGroupName: function customerGroupNameAccessor() {
                return EligibilityService.customerGroup().name();
            },
            answeredQuestions: function answeredQuestionsAccessor() {
                return _answeredQuestions;
            },
            disableBackButton: function showBackButton() {
                if (_answeredQuestions.length > 0) {
                    return false;
                }
                return true;
            },
            continueClick: function continueClick() {

                TaskService.task().eligibilityQAList(_answeredQuestions);
                TaskService.save();
                if (_riskCode) {
                    EligibilityService.resetEligibilityDetails();
                    EligibilityService.riskCode(_riskCode);
                    $state.go('eligibility.details');
                }
                if (_bcaspNo || _accountNo) {
                    SearchService.resetMembershipSearchModel();
                    SearchService.membershipSearchTerm().param().cardNumber(_bcaspNo);
                    SearchService.membershipSearchTerm().param().membershipNumber(_accountNo);
                    SearchService.membershipSearchTerm().param().customerGroupCode(CustomerGroupService.customerGroup().code());

                    SearchService.membershipSearch().then(function membershipSearchSuccess(data) {
                        var companies = null;
                        if (data.length === 0) {
                            return AlertService.createAlert('No entitlements found', AlertTypes.INFO);
                        }

                        companies = SearchService.getCompanyResults();

                        switch (companies.length) {
                        case 0: // do nothing ...
                            break;
                        case 1: // only one company
                            $state.go('company.entitlements');
                            break;
                        default: // multiple hits select from contract
                            $state.go('company.list');
                            break;
                        }

                    }, function membershipSearchFailure(response) {
                        var message = Errors.SYSTEM_ERROR_MESSAGE;
                        if (response.data && response.status === Errors.HTTP_INTERNAL_SERVER_ERROR_CODE) {
                            message = response.data;
                        }
                        return AlertService.createAlert(message, AlertTypes.DANGER);
                    });

                }

            },
            backClick: function backClick() {

                var questionToGoBackTo;
                _questionsAsked.pop();
                _showOutcome = false;
                _eligible = false;
                _answeredQuestions.pop();
                questionToGoBackTo = _questionsAsked[_questionsAsked.length - 1];
                setUpFormFieldDefinitionForQuestion(questionToGoBackTo);
            },
            cancelClick: function cancelClick() {
                eligibilityQuestionsHelper.reset();
                $state.go('home');
            }

        });


    }
]);