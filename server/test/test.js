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
var multiMembers;
var singleMember;

//A short and simple test suite for testing that the basic db connection
// works at all.
module.exports.bareDb = {
    readSingleMember: function (test) {
        test.expect(1);
        fs.readFile('test/singleMember.json', 'utf8', function (err, data) {
            test.ifError(err);
            singleMember = JSON.parse(data);

            test.done();
        });
    },
    readMultiMembers: function (test) {
        test.expect(1);
        fs.readFile('test/multiMembers.json', 'utf8', function (err, data) {
            test.ifError(err);
            multiMembers = JSON.parse(data);

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
    insertSingle: function (test){
        test.expect(2);
        tempDb.collection('members').insert(singleMember, function(err, status) {
            test.ifError(err);
            
            tempDb.collection('members').count("", function(err, result){
                test.equal(result, 1, "Number of documents not 1 after inserting 1");
                test.done();
            });
        });
    },
    insertMulti: function (test){
        test.expect(2);
        tempDb.collection('members').insert(multiMembers.members, function(err, status) {
            test.ifError(err);
            
            tempDb.collection('members').count("", function(err, result){
                // +1 as one member is still in the database from the single member test...
                test.equal(result, multiMembers.members.length+1, "Number of documents not 1 after inserting 1");
                test.done();
                tempDb.close();
            });
        });
    },
};

//process.on('uncaughtException', function(err) {
//  console.error(err.stack);
//});
