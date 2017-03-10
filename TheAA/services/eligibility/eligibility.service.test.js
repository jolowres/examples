require('angular');
require('angular-mocks');

var EligibilityDetails = require('malstrom-models/lib/eligibility-details.model');

describe('eligibility service module', function () {

    var svc,
        http,
        urls;

    beforeEach(function () {
        angular.mock.module(require('./eligibility.service').name);
    });

    beforeEach(angular.mock.inject(function ($httpBackend) {
        http = $httpBackend;
    }));


    beforeEach(angular.mock.inject(function (aahEligibilityURLs) {
        urls = aahEligibilityURLs;
    }));

    beforeEach(angular.mock.inject(function (aahEligibilityService) {
        svc = aahEligibilityService;
    }));

    afterEach(function () {
        http.verifyNoOutstandingExpectation();
        http.verifyNoOutstandingRequest();
    });


    describe('loadAndCacheEligibilityQuestions function tests', function () {

        it('should call the reference data service get eligibility service ', function () {

            var custGroup = {
                code: jasmine.createSpy().and.returnValue('VAU'),
                name: jasmine.createSpy().and.returnValue('Vauxhall')
            };

            var questions;

            var httpResponse = [{
                'questionId': 2,
                'question': 'test question',
                'startingQuestion': false,
                'answerType': 'radio',
                'answers': [{
                    'answerId': 1,
                    'answer': 'Yes',
                    'outcomeText': 'test outcome text',
                    'eligible': false,
                    'nextQuestionId': 4
                }]
            }];

            http.whenGET(urls.ELIGIBILITY_QUESTIONS + '?customerGroupCode=VAU').respond(httpResponse);
            svc.customerGroup(custGroup);
            svc.loadAndCacheEligibilityQuestions();
            http.flush();
            questions = svc.eligibilityQuestions();

            expect(questions.length).toBe(1);

        });


        it('should return the values from the http calls in an object with accessors ', function () {

            var custGroup = {
                code: jasmine.createSpy().and.returnValue('VAU'),
                name: jasmine.createSpy().and.returnValue('Vauxhall')
            };

            var questions;

            var httpResponse = [{
                'questionId': 2,
                'question': 'test question',
                'startingQuestion': false,
                'answerType': 'radio',
                'answers': [{
                    'answerId': 1,
                    'answer': 'Yes',
                    'outcomeText': 'test outcome text',
                    'eligible': false,
                    'nextQuestionId': 4
                }]
            }];

            http.whenGET(urls.ELIGIBILITY_QUESTIONS + '?customerGroupCode=VAU').respond(httpResponse);
            svc.customerGroup(custGroup);
            svc.loadAndCacheEligibilityQuestions();
            http.flush();
            questions = svc.eligibilityQuestions();


            expect(questions[0].questionId()).toBe(2);

        });

        it('should return the values from the http calls in an object with accessors for answers also ', function () {

            var custGroup = {
                code: jasmine.createSpy().and.returnValue('VAU'),
                name: jasmine.createSpy().and.returnValue('Vauxhall')
            };
            var questions;

            var httpResponse = [{
                'questionId': 2,
                'question': 'test question',
                'startingQuestion': false,
                'answerType': 'radio',
                'answers': [{
                    'answerId': 1,
                    'answer': 'Yes',
                    'outcomeText': 'test outcome text',
                    'eligible': false,
                    'nextQuestionId': 4
                }]
            }];

            http.whenGET(urls.ELIGIBILITY_QUESTIONS + '?customerGroupCode=VAU').respond(httpResponse);
            svc.customerGroup(custGroup);
            svc.loadAndCacheEligibilityQuestions();
            http.flush();
            questions = svc.eligibilityQuestions();


            expect(questions[0].answers()[0].outcomeText()).toBe('test outcome text');

        });
    });

    describe('getStartingQuestionQuestion function tests', function () {

        it('should return the starting question from the array of questions', function () {

            var custGroup = {
                code: jasmine.createSpy().and.returnValue('VAU'),
                name: jasmine.createSpy().and.returnValue('Vauxhall')
            };
            var startQuestion;
            var httpResponse = [{
                'questionId': 1,
                'question': 'not the start question',
                'startingQuestion': false
            }, {
                'questionId': 2,
                'question': 'not the start question',
                'startingQuestion': true
            }, {
                'questionId': 3,
                'question': 'not the start question',
                'startingQuestion': false
            }];

            http.whenGET(urls.ELIGIBILITY_QUESTIONS + '?customerGroupCode=VAU').respond(httpResponse);
            svc.customerGroup(custGroup);
            svc.loadAndCacheEligibilityQuestions();
            http.flush();
            startQuestion = svc.getStartQuestion();

            expect(startQuestion.questionId()).toEqual(2);

        });
    });

    describe('getQuestionById function tests', function () {

        it('should return the question with the speicifeid question id from the array of questions', function () {

            var custGroup = {
                code: jasmine.createSpy().and.returnValue('VAU'),
                name: jasmine.createSpy().and.returnValue('Vauxhall')
            };
            var requestedQuestionId = 3;
            var requestedQuestion;
            var httpResponse = [{
                'questionId': 1,
                'question': 'not the start question',
                'startingQuestion': false
            }, {
                'questionId': 2,
                'question': 'not the start question',
                'startingQuestion': true
            }, {
                'questionId': 3,
                'question': 'not the start question',
                'startingQuestion': false
            }];

            http.whenGET(urls.ELIGIBILITY_QUESTIONS + '?customerGroupCode=VAU').respond(httpResponse);
            svc.customerGroup(custGroup);
            svc.loadAndCacheEligibilityQuestions();
            http.flush();
            requestedQuestion = svc.getQuestionById(requestedQuestionId);

            expect(requestedQuestion.questionId()).toEqual(requestedQuestionId);

        });
    });


    it('should use accessr to set and retrieve customer group code', function () {

        var testGroup = 'custGroup';
        expect(svc.customerGroup()).toBeUndefined();
        svc.customerGroup(testGroup);
        expect(svc.customerGroup()).toEqual(testGroup);

    });

    it('should use accessr to set and retrieve risk code code', function () {

        var testValue = 'riskCode';
        expect(svc.riskCode()).toBeUndefined();
        svc.riskCode(testValue);
        expect(svc.riskCode()).toEqual(testValue);

    });

    it('should use accessr to prove validCustomer is false at first', function () {

        expect(svc.validCustomer()).toBe(false);

    });

    it('should use accessr to get and set valid customer value', function () {

        var testValue = true;

        expect(svc.validCustomer()).toBe(false);
        svc.validCustomer(testValue);
        expect(svc.validCustomer()).toEqual(testValue);

    });

    it('should call http post when save method is called', function () {
        svc.eligibilityDetails(new EligibilityDetails());
        http.expectPOST(urls.ELIGIBILITY_DETAILS).respond({});
        svc.save();
        http.flush();

    });

    it('should reset riskCode and questions', function () {
        svc.riskCode('x');
        svc.reset();
        expect(svc.riskCode()).toBeFalsy();

    });

    it('should call the http service for seaahelp when getSeAahelp is called', function(){
        var contractKey = 'TEST';
        http.expectGET(urls.SE_AAHELP.replace(':contractKey', contractKey)).respond({});
        svc.getSeAahelp(contractKey);
        http.flush();
    });

    it('should return seaahelp data seaahelp when getSeAahelp is called and http resolves', function(){
        expect(1).toEqual(1);
        var contractKey = 'TEST',
            response = [{contractKey: 'testResult'}];
        http.whenGET(urls.SE_AAHELP.replace(':contractKey', contractKey)).respond(response);
        svc.getSeAahelp(contractKey).then(function (result) {
            expect(result.contractKey()).toEqual(response[0].contractKey);
        });
        http.flush();
    });
});