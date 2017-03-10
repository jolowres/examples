var _ = require('lodash');
require('angular');

module.exports = angular.module('aah-eligibility-questions-helper-module', [

]).service('aahEligibilityQuestionsHelper', [
    function EligibilityQuestionsHelper() {

        var svc,
            _fieldDefinition = [],
            _answerValue = null,
            _currentQuestion;


        svc = this;

        _.extend(svc, {

            answerValue: function answerValueAccessor() {
                return _answerValue;
            },
            currentQuestion: function currentQuestionAccessor(val) {
                return arguments.length ? _currentQuestion = val : _currentQuestion;
            },
            getAnswer:  function getAnswer(answerId) {
                var _answer;
                _.forEach(_currentQuestion.answers(), function forEachAnswer(answer, idx) {

                    if (answer.answerId() === answerId) {
                        _answer = answer;
                    }
                });
                return _answer;

            },
            createSelectionFieldDefinition: function createSelectionFieldDefinition(question) {

                var questionField,
                    supportingInfoField,
                    supportingInfoText,
                    options = [],
                    option;

                //make sure field definition is empty before creating it
                _fieldDefinition = [];

                _.forEach(question.answers(), function(answer) {
                    option = {
                        name: answer.answerText(),
                        value: answer.answerId()
                    };
                    options.push(option);
                });

                questionField = {
                    key: 'answerId',
                    type: question.answerType(),
                    templateOptions: {
                        label: question.questionText(),
                        options: options,
                        onClick: function(value) {
                            _answerValue = value;
                        }
                    }
                };

                _fieldDefinition.push(questionField);


                if (question.supportingInfoUrl()) {
                    supportingInfoText = '<p class="info"> Extra information found here: <a href="' + question.supportingInfoUrl() + '" target="_blank">' + question.supportingInfoUrl() + '</a> </p>';
                    supportingInfoField = {
                        noFormControl: true,
                        template: supportingInfoText
                    };
                    _fieldDefinition.push(supportingInfoField);
                }

                return _fieldDefinition;
            },
            reset: function reset() {
                _fieldDefinition = [];
                _answerValue = null;
            }

        });



    }]);