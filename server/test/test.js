"use strict";

var memberDB = require('../memberDB');
var testCase = require('nodeunit').testCase;
var fs = require('fs');

var Cdb = require('../Cdb');

var MongoClient = require('mongodb').MongoClient;
var async = require('async')

var assert = require('assert')
var ObjectId = require('mongodb').ObjectID;
var dbName = "makerMember_test"
var dbUrl = 'mongodb://localhost:27017/'+dbName;

var db;
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
        MongoClient.connect(dbUrl, function(err, tempDb) {
            test.ifError(err);
            db = tempDb;
            
            test.done();
        });
    },
    dropDatabase: function (test) {
        test.expect(1);
        db.dropDatabase(function(err, status) {
            test.ifError(err);
            
            test.done();
        });
    },
    insertSingle: function (test){
        test.expect(2);
        db.collection('members').insert(singleMember, function(err, status) {
            test.ifError(err);
            
            db.collection('members').count("", function(err, result){
                test.equal(result, 1, "Number of documents not 1 after inserting 1");
                test.done();
            });
        });
    },
    insertMulti: function (test){
        test.expect(2);
        db.collection('members').insert(multiMembers.members, function(err, status) {
            test.ifError(err);
            
            db.collection('members').count("", function(err, result){
                // +1 as one member is still in the database from the single member test...
                test.equal(result, multiMembers.members.length+1, "Number of documents not 1 after inserting 1");
                test.done();
                db.close();
            });
        });
    },
};

var cdb;
module.exports.protectedDb = {
    setUp: function (callback) {
        MongoClient.connect(dbUrl, function(err, tmpDb) {
            assert.equal(null, err);
            
            db = tmpDb;
            
            db.dropDatabase(function(err, status) {
                assert.equal(null, err);
                
	            cdb = new Cdb(db);
	            cdb.configure(function(){    
	                callback();
	            });
	            
            });
        });
    },
    insertOneMember: function (test){
        test.expect(4);
        async.series([
            function(callback){
                fs.readFile('test/singleMember.json', 'utf8', function (err, data) {
                    test.ifError(err);
                    singleMember = JSON.parse(data);
                    callback(err, singleMember);
                });
            },
            function(callback){
                cdb.addMember(singleMember, function(err, data){
                    test.ifError(err)
                    callback(err, data);
                });
            },
            function(callback){
                cdb.getMember("larlin", "test", function(err, data){
                    test.ifError(err);
                    test.equal(data.length, 1);
                    console.log(data[0]);
                    
                    
                    callback(err, data);
                });
            }
        ],
        function(err, result){
        	test.done();
        });
    },
    tearDown: function (callback) {
        db.close();
        
        callback();
    }
}

//module.exports.roles = {
//    
//}

//process.on('uncaughtException', function(err) {
//  console.error(err.stack);
//});
