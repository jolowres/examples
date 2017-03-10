require('angular');
require('angular-mocks');
require('angular-formly');
require('angular-formly-templates-bootstrap');
var CustomerGroup = require('malstrom-models/lib/customer-group.model');

describe('eligibility questions controller module', function () {

    var ctrl;
    var q;
    var mockEligibilityService;
    var mockEligibilityQuestionsHelper;
    var mockSearchService;
    var mockAlertService;
    var mockTaskService;
    var mockCustomerGroupService;
    var scope;
    var questionPromise;
    var mockState;


    var mockQuestion = {
        answerType: jasmine.createSpy()
    };

    beforeEach(angular.mock.module(function ($provide)  {
        $provide.value('night-theme', false);
    }));

    beforeEach(function () {
        angular.mock.module(require('./eligibility-questions.controller.js').name);
    });

    beforeEach(angular.mock.module(function ($provide)  {
        mockEligibilityService = {
            loadAndCacheEligibilityQuestions: jasmine.createSpy(),
            eligibilityQuestions: jasmine.createSpy(),
            customerGroupCode: jasmine.createSpy(),
            customerGroupName: jasmine.createSpy(),
            getStartQuestion: jasmine.createSpy().and.returnValue(mockQuestion),
            getQuestionById: jasmine.createSpy(),
            customerGroup: jasmine.createSpy().and.returnValue({
                name: jasmine.createSpy().and.returnValue('TEST_NAME'),
                code: jasmine.createSpy().and.returnValue('TEST_CODE')
            }),
            riskCode: jasmine.createSpy(),
            resetEligibilityDetails: jasmine.createSpy()

        };
        $provide.value('aahEligibilityService', mockEligibilityService);
    }));

    beforeEach(angular.mock.module(function ($provide)  {
        mockState = {
            go: jasmine.createSpy()
        };

        $provide.value('$state', mockState);
    }));

    beforeEach(angular.mock.inject(function(aahTaskService) {
        mockTaskService = aahTaskService;
        spyOn(mockTaskService, 'task').and.callThrough();
        spyOn(mockTaskService, 'save');
    }));

    beforeEach(angular.mock.inject(function(aahEligibilityQuestionsHelper) {
        mockEligibilityQuestionsHelper = aahEligibilityQuestionsHelper;
        spyOn(mockEligibilityQuestionsHelper, 'answerValue');
        spyOn(mockEligibilityQuestionsHelper, 'currentQuestion');
        spyOn(mockEligibilityQuestionsHelper, 'getAnswer');
        spyOn(mockEligibilityQuestionsHelper, 'createSelectionFieldDefinition');
        spyOn(mockEligibilityQuestionsHelper, 'reset');
    }));

    beforeEach(angular.mock.inject(function(aahSearchService) {
        mockSearchService = aahSearchService;
        spyOn(mockSearchService, 'membershipSearch');
        spyOn(mockSearchService, 'membershipSearchTerm').and.callThrough();
    }));

    beforeEach(angular.mock.inject(function(aahAlertService) {
        mockAlertService = aahAlertService;
        spyOn(mockAlertService, 'createAlert');
    }));

    beforeEach(angular.mock.inject(function(aahCustomerGroupService) {
        mockCustomerGroupService = aahCustomerGroupService;
        spyOn(mockCustomerGroupService, 'customerGroup').and.returnValue(new CustomerGroup());
    }));

    beforeEach(angular.mock.inject(function ($q) {
        q = $q;
    }));

    beforeEach(function () {
        questionPromise = q.defer();
        mockEligibilityService.loadAndCacheEligibilityQuestions.and.returnValue(questionPromise.promise);
    });

    beforeEach(angular.mock.inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        ctrl = $controller('aahEligibilityQuestionsController',
            {$scope: scope});
    }));



    describe('initialisation of controller tests', function () {
        it('should call the loadAndCacheEligibilityQuestions when the controller is first loaded.',  function () {
            expect(mockEligibilityService.loadAndCacheEligibilityQuestions).toHaveBeenCalled();
        });

        it('should call the getStartQuestion when the controller is first loaded.', function () {
            questionPromise.resolve();
            scope.$apply();
            expect(mockEligibilityService.getStartQuestion).toHaveBeenCalled();
        });

        it('should call process answer if the watch value is set for answer value', function () {
            mockEligibilityQuestionsHelper.answerValue.and.returnValue('TEST_ANSWER');
            mockEligibilityQuestionsHelper.currentQuestion.and.returnValue({
                questionId: jasmine.createSpy(),
                questionText: jasmine.createSpy(),
                selectedAnswer: jasmine.createSpy()
            });
            mockEligibilityQuestionsHelper.getAnswer.and.returnValue({
                answerText: jasmine.createSpy(),
                nextQuestionId: jasmine.createSpy(),
                outcomeText: jasmine.createSpy(),
                eligible: jasmine.createSpy()
            });

            questionPromise.resolve();
            scope.$apply();
            expect(mockEligibilityQuestionsHelper.getAnswer).toHaveBeenCalled();
            expect(ctrl.answeredQuestions().length).toEqual(1);

        });

    });

    describe('testing the different outcomes when the watch fires tests', function () {

        it('should call getAndDisplayNextQuestion if the watch value is set for answer value that contains next question', function () {
            mockEligibilityQuestionsHelper.answerValue.and.returnValue('TEST_ANSWER');
            mockEligibilityQuestionsHelper.currentQuestion.and.returnValue({
                questionId: jasmine.createSpy(),
                questionText: jasmine.createSpy(),
                selectedAnswer: jasmine.createSpy()
            });
            mockEligibilityQuestionsHelper.getAnswer.and.returnValue({
                answerText: jasmine.createSpy(),
                nextQuestionId: jasmine.createSpy().and.returnValue(12),
                outcomeText: jasmine.createSpy(),
                eligible: jasmine.createSpy()
            });

            questionPromise.resolve();
            scope.$apply();
            expect(mockEligibilityService.getQuestionById).toHaveBeenCalledWith(12);

        });

        it('should call set show outcome to true if the watch value is set for answer value that contains outcomeText', function () {
            mockEligibilityQuestionsHelper.answerValue.and.returnValue('TEST_ANSWER');
            mockEligibilityQuestionsHelper.currentQuestion.and.returnValue({
                questionId: jasmine.createSpy(),
                questionText: jasmine.createSpy(),
                selectedAnswer: jasmine.createSpy()
            });
            mockEligibilityQuestionsHelper.getAnswer.and.returnValue({
                answerText: jasmine.createSpy(),
                nextQuestionId: jasmine.createSpy(),
                outcomeText: jasmine.createSpy().and.returnValue('Outcome Text'),
                eligible: jasmine.createSpy(),
                outcomeInfoUrl: jasmine.createSpy()
            });

            questionPromise.resolve();
            scope.$apply();
            expect(ctrl.showOutcome()).toBe(true);

        });

        it('should set the risk code if the outcome is eligible to true if the watch value is set for answer value that contains outcomeText', function () {
            mockEligibilityQuestionsHelper.answerValue.and.returnValue('TEST_ANSWER');
            mockEligibilityQuestionsHelper.currentQuestion.and.returnValue({
                questionId: jasmine.createSpy(),
                questionText: jasmine.createSpy(),
                selectedAnswer: jasmine.createSpy()
            });
            mockEligibilityQuestionsHelper.getAnswer.and.returnValue({
                answerText: jasmine.createSpy(),
                nextQuestionId: jasmine.createSpy(),
                outcomeText: jasmine.createSpy(),
                eligible: jasmine.createSpy().and.returnValue(true),
                outcomeInfoUrl: jasmine.createSpy(),
                riskCode: jasmine.createSpy().and.returnValue('TEST'),
                accountNo: jasmine.createSpy(),
                bcaspNo: jasmine.createSpy()
            });

            questionPromise.resolve();
            scope.$apply();
            expect(ctrl.riskCode()).toEqual('TEST');

        });

    });

    describe('test the controller properties', function () {

        it('should set and retrieve the showOutcome accessor', function(){
            var testValue = false;
            ctrl.showOutcome(false);
            expect(ctrl.showOutcome()).toEqual(testValue);
        });

        it('should set and retrieve the eligible accessor', function(){
            var testValue = false;
            ctrl.eligible(false);
            expect(ctrl.eligible()).toEqual(testValue);
        });

        it('should set and retrieve the outcome accessor', function(){
            var testValue = 'OUTCOME';
            ctrl.outcome(testValue);
            expect(ctrl.outcome()).toEqual(testValue);
        });

        it('should set and retrieve the riskCode accessor', function(){
            var testValue = 'RISK_CODE';
            ctrl.riskCode(testValue);
            expect(ctrl.riskCode()).toEqual(testValue);
        });

        it('should set and retrieve the outcomeInfoUrl accessor', function(){
            var testValue = 'INFO';
            ctrl.outcomeInfoUrl(testValue);
            expect(ctrl.outcomeInfoUrl()).toEqual(testValue);
        });

        it('should set and retrieve the eligibilityQuestionFieldDefinition accessor', function(){
            var testValue = 'definition';
            ctrl.eligibilityQuestionFieldDefinition(testValue);
            expect(ctrl.eligibilityQuestionFieldDefinition()).toEqual(testValue);
        });

        it('should retrieve the customerGroupName accessor', function(){

            expect(ctrl.customerGroupName()).toEqual('TEST_NAME');
        });

        it('should reset properties when the back click button is pressed', function(){

            ctrl.showOutcome(true);
            ctrl.eligible(true);
            ctrl.backClick();
            expect(ctrl.showOutcome()).toEqual(false);
            expect(ctrl.eligible()).toEqual(false);
        });

        it('should return true when disableBackButton is called and no questions have been answered', function(){
            expect(ctrl.disableBackButton()).toBe(true);
        });

        it('should call state.go when the continue button is pressed and the risk code is set', function(){
            ctrl.riskCode('SET');
            ctrl.continueClick();
            expect(mockState.go).toHaveBeenCalled();
        });

        it('should not call state.go when the continue button is pressed and the risk code is not set', function(){
            ctrl.continueClick();
            expect(mockState.go).not.toHaveBeenCalled();
        });

        it('should call state.go with the home value when cancelClick is called', function(){
            ctrl.cancelClick();
            expect(mockState.go).toHaveBeenCalledWith('home');
        });

        it('should call the task service and service when the continue button is clicked', function(){
            ctrl.continueClick();
            expect(mockTaskService.save).toHaveBeenCalled();
        });

        it('should return false when disableBackButton is called and questions have been answered', function(){
            mockEligibilityQuestionsHelper.answerValue.and.returnValue('TEST_ANSWER');
            mockEligibilityQuestionsHelper.currentQuestion.and.returnValue({
                questionId: jasmine.createSpy(),
                questionText: jasmine.createSpy(),
                selectedAnswer: jasmine.createSpy()
            });
            mockEligibilityQuestionsHelper.getAnswer.and.returnValue({
                answerText: jasmine.createSpy(),
                nextQuestionId: jasmine.createSpy(),
                outcomeText: jasmine.createSpy().and.returnValue('Outcome Text'),
                eligible: jasmine.createSpy(),
                outcomeInfoUrl: jasmine.createSpy()
            });

            questionPromise.resolve();
            scope.$apply();
            expect(ctrl.disableBackButton()).toBe(false);
        });

        it('should call eligibility helper reset when cancelClick is called', function(){
            ctrl.cancelClick();
            expect(mockEligibilityQuestionsHelper.reset).toHaveBeenCalled();
        });

        it('should set and retrieve the account no accessor', function(){
            var testValue = 'ACCOUNT_NO';
            ctrl.accountNo(testValue);
            expect(ctrl.accountNo()).toEqual(testValue);
        });

        it('should set and retrieve the bcasp no accessor', function(){
            var testValue = 'BCASP_NO';
            ctrl.bcaspNo(testValue);
            expect(ctrl.bcaspNo()).toEqual(testValue);
        });

        it('should call Search service with accountNo when the continue button is pressed and the accountNo is set', function(){
            var deferred = q.defer();
            mockSearchService.membershipSearch.and.returnValue(deferred.promise);
            ctrl.accountNo('ACCOUNT_NO');
            ctrl.continueClick();
            expect(mockSearchService.membershipSearch).toHaveBeenCalled();
        });

        it('should call Search service with bcaspNo when the continue button is pressed and the bcaspNo is set', function(){
            var deferred = q.defer();
            mockSearchService.membershipSearch.and.returnValue(deferred.promise);
            ctrl.bcaspNo('BCASP_NO');
            ctrl.continueClick();
            expect(mockSearchService.membershipSearch).toHaveBeenCalled();
        });

        it('should call the alert service if the search service resolves with no data', function() {
            var deferred = q.defer();
            mockSearchService.membershipSearch.and.returnValue(deferred.promise);
            ctrl.bcaspNo('BCASP_NO');
            ctrl.continueClick();
            deferred.resolve([]); //empty array
            scope.$apply();
            expect(mockAlertService.createAlert).toHaveBeenCalledWith('No entitlements found', 'info');
        });

        it('should call the search service getCompanyResults service if the search service resolves with data', function() {
            var deferred = q.defer();
            mockSearchService.membershipSearch.and.returnValue(deferred.promise);
            spyOn(mockSearchService, 'getCompanyResults').and.returnValue([]);
            ctrl.bcaspNo('BCASP_NO');
            ctrl.continueClick();
            deferred.resolve(['DATA']);
            scope.$apply();
            expect(mockSearchService.getCompanyResults).toHaveBeenCalled();
        });


        it('should call state go for company.entitlements if the search service resolves with data and 1 company is returned', function() {
            var deferred = q.defer();
            mockSearchService.membershipSearch.and.returnValue(deferred.promise);
            spyOn(mockSearchService, 'getCompanyResults').and.returnValue(['COMPANY']); // 1 result
            ctrl.bcaspNo('BCASP_NO');
            ctrl.continueClick();
            deferred.resolve(['DATA']);
            scope.$apply();
            expect(mockState.go).toHaveBeenCalledWith('company.entitlements');
        });

        it('should call state go for company.list if the search service resolves with data and more than one company is returned', function() {
            var deferred = q.defer();
            mockSearchService.membershipSearch.and.returnValue(deferred.promise);
            spyOn(mockSearchService, 'getCompanyResults').and.returnValue(['COMPANY ONE', 'COMPANY TWO']); // 1 result
            ctrl.bcaspNo('BCASP_NO');
            ctrl.continueClick();
            deferred.resolve(['DATA']);
            scope.$apply();
            expect(mockState.go).toHaveBeenCalledWith('company.list');
        });

        it('should call the alert service if the search service membership search fails', function() {
            var deferred = q.defer();
            mockSearchService.membershipSearch.and.returnValue(deferred.promise);
            ctrl.bcaspNo('BCASP_NO');
            ctrl.continueClick();
            deferred.reject('error');
            scope.$apply();
            expect(mockAlertService.createAlert).toHaveBeenCalledWith('There is a problem searching for membership records. If the problem persists, please contact the IT service desk', 'danger');
        });

        it('should call the alert service with message if response code is 500 when entitlement search fails', function() {
            var deferred = q.defer(),
                testMessage = 'message';
            mockSearchService.membershipSearch.and.returnValue(deferred.promise);
            ctrl.bcaspNo('BCASP_NO');
            ctrl.continueClick();
            deferred.reject({
                data: testMessage,
                status:500
            });
            scope.$apply();
            expect(mockAlertService.createAlert).toHaveBeenCalledWith(testMessage, 'danger');
        });


    });

});