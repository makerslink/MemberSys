"use strict";

var Cdb = require('./Cdb')

var MongoClient = require('mongodb').MongoClient;

var assert = require('assert')
var ObjectId = require('mongodb').ObjectID;
var dbName = "makerMember"
var dbUrl = 'mongodb://localhost:27017/'+dbName;

var memberDB = function(){};

memberDB.connect = function(callback){
    MongoClient.connect(dbUrl, function(err, db) {
        assert.equal(null, err);
        
	    var cdb = new Cdb(db);
	    
	    callback(null, cdb);
    });
};

exports = module.exports = memberDB;
