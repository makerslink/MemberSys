var connect = require('connect')
var http = require('http')
var serveStatic = require('serve-static')
var Cdb = require('./Cdb')

var app = connect()

var serve = serveStatic('static', {'index': ['index.html', 'index.htm']})

app.use( serve )

//create node.js http server and listen on port
http.createServer(app).listen(3000)

var MongoClient = require('mongodb').MongoClient;

var assert = require('assert')
var ObjectId = require('mongodb').ObjectID;
var dbName = "makerMember"
var dbUrl = 'mongodb://localhost:27017/'+dbName;


MongoClient.connect(dbUrl, function(err, db) {
    assert.equal(null, err);
    
	var cdb = new Cdb(db);
    
    var larlin = {email:{address:"larlin@lysator.liu.se", visibility:"private"}};
	
	cdb.addMember(larlin);
});
