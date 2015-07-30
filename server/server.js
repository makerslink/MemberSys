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
	              
	var larlin = {"fields":[{"email":"test@test.test", "visibility":"private"},
	                        {"username":"larlin", "visibility":"public"},
	                        {"name":"Lars", "visibility":"members"}]};
	//cdb.addMember(function(err, data){}, larlin);
	cdb.getMember(function(err, data){}, "larlin", "larlin");
})
