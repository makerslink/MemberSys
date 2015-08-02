"use strict";

var connect = require('connect')
var http = require('http')
var serveStatic = require('serve-static')
var memberDB = require('./memberDB')

var app = connect()

var serve = serveStatic('static', {'index': ['index.html', 'index.htm']})

app.use( serve )

//create node.js http server and listen on port
http.createServer(app).listen(3000)

memberDB.connect(function(err, cdb) {
	              
	var larlin = {"fields":[{"type":"email", "value":"test@test.test", "visibility":"private"},
	                        {"type":"username", "value":"larlin", "visibility":"public"},
	                        {"type":"name", "value":"Lars", "visibility":"members"}]};
	//cdb.addMember(function(err, data){}, larlin);
	cdb.getMember("larlin", "test",
	    function(err, data){
	        if(err == null){
	            for(var row in data){
                    console.log(data[row]);
                }
            }else{
                console.log(err);
            }
	    });
})
