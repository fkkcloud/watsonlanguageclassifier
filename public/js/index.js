/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

'use strict';

$(document).ready(function() {

  // jQuery variables attached to DOM elements
  var $error = $('.error'),
    $errorMsg = $('.errorMsg'),
    $loading = $('.loading'),
    $results = $('.results'),
    $classification = $('.classification'),
    $confidence = $('.confidence'),
    $question = $('.questionText'),
    $traindata = $('.trainData');

/* -- CHECK CLASSIFIER -- */
  $('.check-btn').click(function() {
    checkClassifier();
  });

/* -- TRAIN DATA -- */
  $('.train-btn').click(function() {
    trainData();
  });

/* -- ASK QUESTION -- */
  $('.ask-btn').click(function() {
    askQuestion($question.val());
    $question.focus();
  });

  $('.questionText').keyup(function(event){
    if(event.keyCode === 13) {
      askQuestion($question.val());
    }
  });

/* -- Functions -- */

  var current_classifier_id;

  // Check the status of the classifier
  var checkClassifier = function() {
    $loading.show();

    var req = { 'classifier_id' : current_classifier_id };

    $.post('/check', req)
    .done(function onSucess(data) {
      console.log('checl:',data);
    })
    .fail(function onError(error){
      console.log('failed:', error);
    })
    .always(function always() {
      $loading.hide();
    })
  }

  // Send data to the classifier and train the data
  var trainData = function() {

    $loading.show();

    $.post('/train')
    .done(function onSucess(data) {
      //console.log('succss:', data);
      console.log('classifier id:', data.classifier_id);
      current_classifier_id = data.classifier_id;
    })
    .fail(function onError(error) {
      console.log('failed:', error);
    })
    .always(function always() {
      $loading.hide();
    })

  }

  // Ask a question via POST to /
  var askQuestion = function(question) {
    if ($.trim(question) === '')
      return;

    $question.val(question);

    $loading.show();
    $error.hide();
    $results.hide();

    $.post('/ask', {text: question})
      .done(function onSucess(answers){
        $results.show();
        $classification.text(answers.top_class);
        $confidence.text(Math.floor(answers.classes[0].confidence * 100) + '%');
        $('html, body').animate({ scrollTop: $(document).height() }, 'fast');
      })
      .fail(function onError(error) {
        $error.show();
        $errorMsg.text(error.responseJSON.error ||
         'There was a problem with the request, please try again');
      })
      .always(function always(){
        $loading.hide();
      });
  };

  [
    'Is it hot outside?',
    'What is the expected high for today?',
    'Will it be foggy tomorrow morning?',
    'Should I prepare for sleet?',
    'Will there be a storm today?'
  ].forEach(function(question){
    $('<a>').text(question)
      .mousedown(function() {
        askQuestion(question);
        return false;
      })
      .appendTo('.example-questions');
  });


});
