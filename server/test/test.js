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


exports.dbInsert = function(test){

    //TODO: Load this from a json file...
    var document = '{"fields":[{"type":"email", "value":"test@test.test", "visibility":"private"}]}';
    var db;

    async.waterfall([
        function(callback){
            MongoClient.connect(dbUrl, function(err, tempdb) {
                test.ifError(err);
                
	            db = tempdb
	            
	            callback(null);
            });
        },
        function(callback){
            db.dropDatabase(function(err, status) {
                test.ifError(err);
                
                callback(null);
            });
        },
        function(callback){
            db.collection('members').insert(JSON.parse(document), function(err, status) {
                test.ifError(err);
                
                db.close();
                
                callback(null);
            });
        }
    ]);
    test.done();
    
};
