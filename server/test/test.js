"use strict";

var memberDB = require('../memberDB')

var MongoClient = require('mongodb').MongoClient;
var async = require('async')

var assert = require('assert')
var ObjectId = require('mongodb').ObjectID;
var dbName = "makerMember_test"
var dbUrl = 'mongodb://localhost:27017/'+dbName;

//Clean database...
//db.dropCollection(collection, callback);
//MongoClient.connect(dbUrl, function(err, db)

//nodeunit npm nodeunit


//TODO: Load this from a json file...
var document = '{"fields":[{"type":"email", "value":"test@test.test", "visibility":"private"}]}';
var db;

async.waterfall([
    function(callback){
        MongoClient.connect(dbUrl, function(err, tempdb) {
            assert.equal(null, err);
            
	        db = tempdb
	        
	        callback(null);
        });
    },
    function(callback){
        db.dropDatabase(function(err, status) {
            assert.equal(null, err);
            
            callback(null);
        });
    },
    function(callback){
        db.collection('members').insert(JSON.parse(document), function(err, status) {
            assert.equal(null, err);
            
            callback(null);
        });
    }
]);


