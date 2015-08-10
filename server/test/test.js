"use strict";

var memberDB = require('../memberDB');
var testCase = require('nodeunit').testCase;
var fs = require('fs');

var MongoClient = require('mongodb').MongoClient;
var async = require('async')

var assert = require('assert')
var ObjectId = require('mongodb').ObjectID;
var dbName = "makerMember_test"
var dbUrl = 'mongodb://localhost:27017/'+dbName;

var tempDb;
var document;
module.exports.bareDb = {
    readJson: function (test) {
        fs.readFile('test/testData.json', 'utf8', function (err, data) {
            test.ifError(err);
            document = JSON.parse(data);

            test.done();
        });
    },
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
        tempDb.collection('members').insert(document, function(err, status) {
            test.ifError(err);
            tempDb.close();
            
            test.done();
        });
    },
};

process.on('uncaughtException', function(err) {
  console.error(err.stack);
});
