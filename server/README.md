MemberSys
=========

Setup
-----

Install dependencies:

    $ npm install

Install mongoDB:

	$ brew install mongodb
	$ mkdir db_storage

Start server
------------

	$ mongod --dbpath db_storage
	$ node server.js

Client
------

Point your browser to http://127.0.0.1:3000
