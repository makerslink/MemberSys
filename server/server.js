var connect = require('connect')
var http = require('http')
var serveStatic = require('serve-static')

var app = connect()

var serve = serveStatic('static', {'index': ['index.html', 'index.htm']})

app.use( serve )

//create node.js http server and listen on port
http.createServer(app).listen(3000)
