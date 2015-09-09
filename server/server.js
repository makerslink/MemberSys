"use strict";

var connect = require('connect')
var http = require('http')
var serveStatic = require('serve-static')
var memberDB = require('./memberDB')
var async = require('async')

var app = connect()

var serve = serveStatic('static', {'index': ['index.html', 'index.htm']})


app.use( serve );

//create node.js http server and listen on port
var srv = http.createServer(app).listen(3000, function() {
    console.log('Listening on *:3000');
});

//
// Socket stuff
//
var io = require('socket.io')(srv);

io.on('connection', function(socket){
    console.log('A user connected');
    socket.emit('news', { hello: 'world' });
});

// 
// Database stuff
//
memberDB.connect(function(err, cdb) {
	              
	var test = {"fields":[{"type":"email", "value":"test@test.test", "visibility":"private"},
	                      {"type":"username", "value":"larlin", "visibility":"public"},
	                      {"type":"name", "value":"Lars", "visibility":"members"}]};
	//cdb.addMember(test, function(err, data){});
	
	var admin = "larlin";
	
    async.series([
        function(callback){
            cdb.configure(function(){    
                callback();
            });
        },
        function(callback){
            cdb.addFirstAdmin(admin, function(err, data) {
                callback(err);
            });
        },
        //function(callback){
        //    cdb.addMember(test, function(err, data) {callback(err);});
        //},
        function(callback){
            cdb.getMember("larlin", "test", function(err, data){
                if(err == null){
                    for(var row in data){
                        console.log(data[row]);
                    }
                }else{
                    console.log(err);
                }
            });
        }
    ]);	
})
