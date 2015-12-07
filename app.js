/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express    = require('express'),
  app          = express(),
  bluemix      = require('./config/bluemix'),
  extend       = require('util')._extend,
  watson       = require('watson-developer-cloud'),
  fs           = require('fs');

// Bootstrap application settings
require('./config/express')(app);

// if bluemix credentials exists, then override local
var credentials = extend({
    "version": 'v1',
    "url": "https://gateway.watsonplatform.net/natural-language-classifier/api",
    "username": "637d6b17-1f10-4764-a049-389e7610f06a",
    "password": "6B5msS1eags5",
}, bluemix.getServiceCreds('natural_language_classifier')); // VCAP_SERVICES

// Create the service wrapper
var nlClassifier = watson.natural_language_classifier(credentials);

// render index page
app.get('/', function(req, res) {
  res.render('index');
});

// Call the pre-trained classifier with body.text
// Responses are json
app.post('/ask', function(req, res, next) {
  var params = {
    classifier: process.env.CLASSIFIER_ID || '3AE103x13-nlc-1059', // pre-trained classifier
    text: req.body.text
  };

  nlClassifier.classify(params, function(err, results) {
    if (err)
      return next(err);
    else
      res.json(results);
  });
});

// Call to train classifier with csv
// Responses are json
app.post('/train', function(req, res, next) {
  
  var fs_filepath = fs.createReadStream('./training/train_data.csv');

  var params = {
    "language"          : 'en',
    "name"              : 'Test classifier',
    "training_data"     : fs_filepath
  };

  nlClassifier.create(params, function(err, results) {
    if (err){
      return next(err);
    }
    else{
      console.log('SUCCESS:', results);
      res.json(results);
    }
  });
});

// Call the pre-trained classifier to check status
// Responses are json
app.post('/check', function(req, res, next) {
  
  var params = {
    "classifier_id"          : req.classifier_id
  };

  nlClassifier.status(params, function(err, results) {
    if (err){
      return next(err);
    }
    else{
      console.log('SUCCESS:', results);
      res.json(results);
    }
  });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.code = 404;
  err.message = 'Not Found';
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  var error = {
    code: err.code || 500,
    error: err.message || err.error
  };
  console.log('error:', error);

  res.status(error.code).json(error);
});

var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);
console.log('listening at:', port);
