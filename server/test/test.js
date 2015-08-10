"use strict";

var memberDB = require('../memberDB');
var testCase = require('nodeunit').testCase;

var MongoClient = require('mongodb').MongoClient;
var async = require('async')

var assert = require('assert')
var ObjectId = require('mongodb').ObjectID;
var dbName = "makerMember_test"
var dbUrl = 'mongodb://localhost:27017/'+dbName;

var document = '{"fields":[{"type":"email", "value":"test@test.test", "visibility":"private"}]}';

var tempDb;
module.exports.bareDb = {
    connect: function (test) {
        test.expect(1);
        MongoClient.connect(dbUrl, function(err, db) {
            test.ifError(err);
            tempDb = db;
            
            test.done();
        });
    },
    dropDatabase: function (test) {
        test.expect(1);
        tempDb.dropDatabase(function(err, status) {
            test.ifError(err);
            
            test.done();
        });
    },
    insert: function (test){
        test.expect(1);
        tempDb.collection('members').insert(JSON.parse(document), function(err, status) {
            test.ifError(err);
            tempDb.close();
            
            test.done();
        });
    },
};

process.on('uncaughtException', function(err) {
  console.error(err.stack);
});
