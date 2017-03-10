require('angular');
require('angular-mocks');

describe('eligibility questions helper module', function () {

    var svc;
    var mockQuestion;

    mockAnswer = {
        answerText: jasmine.createSpy(),
        answerId: jasmine.createSpy()
    };

    mockQuestion = {
        questionId: jasmine.createSpy(),
        questionText: jasmine.createSpy(),
        answers: jasmine.createSpy().and.returnValue(
            [
                mockAnswer
            ]),
        answerType: jasmine.createSpy(),
        supportingInfoUrl: jasmine.createSpy()
    };

    beforeEach(angular.mock.module(function ($provide)  {
        $provide.value('night-theme', false);
    }));

    beforeEach(function () {
        angular.mock.module(require('./eligibility-questions.helper.js').name);
    });


    beforeEach(angular.mock.inject(function (aahEligibilityQuestionsHelper) {
        svc = aahEligibilityQuestionsHelper;
    }));


    it('should return an array when createSelectionFieldDefinition is called', function () {

        expect(svc.createSelectionFieldDefinition(mockQuestion).length).toEqual(1);

    });

    it('should return an array of two if supporting info is specified when createSelectionFieldDefinition is called', function () {
        mockQuestion.supportingInfoUrl.and.returnValue('TEST_INFO');
        expect(svc.createSelectionFieldDefinition(mockQuestion).length).toEqual(2);

    });

    it('should return return the current question when the question is set', function () {
        var testQustion = 'are you a question?';
        svc.currentQuestion(testQustion);
        expect(svc.currentQuestion()).toEqual(testQustion);

    });

    it('should return the correct answer from the getAnswer method for answerId provided', function() {

        var testResult;
        var mockAnswer1 = {
            answerText: jasmine.createSpy().and.returnValue('answer one'),
            answerId: jasmine.createSpy().and.returnValue(1)
        };

        var mockAnswer2 = {
            answerText: jasmine.createSpy().and.returnValue('answer two'),
            answerId: jasmine.createSpy().and.returnValue(2)
        };

        var theQuestion = {
            answers: jasmine.createSpy().and.returnValue(
                [
                    mockAnswer1, mockAnswer2
                ])

        };

        svc.currentQuestion(theQuestion);

        testResult = svc.getAnswer(2);
        expect(testResult).toEqual(mockAnswer2);


    });

    it('should reset the answer when reset is called', function () {
        svc.reset();
        expect(svc.answerValue()).toBeNull();
    });



});