var acl = require('acl');
var assert = require('assert')
var async = require('async')

var Cdb = function (db){
    this.db = db;
    this.acl = new acl(new acl.mongodbBackend(db, "acl"));
    //Add that public is allowed to add members...
    this.acl.allow("public", "members", "add");
    //this.acl.removeAllow("public", "members", "add");
}

// Create a Controlled db that is controlled by ACL.

Cdb.prototype.setRequiredFields = function(fields){
    this.requiredFields = fields;
}
Cdb.prototype.addMember = function(member){
    for(field in this.requiredFields){
        if (!(field in member) || member[field].trim().length == 0){
            //The required field dosen't exist or is a empty string.
            //TODO:Throw a error in some way...
        }
    }
    
    for(field in member){
        if (!("visibility" in member[field])){
            //Add default visibility
            member[field]["visibility"] = "private";
        }
    }
    //Bind locally for callbacks...
    db = this.db;
    
    var alloved = false;
    var acl = this.acl;
    
    async.series([
        function(callback){
            acl.areAnyRolesAllowed("public", "members", "add", function(err, res){
                alloved = res;
                callback(err, alloved);
            })
        },
        function(callback){
            if(alloved){
                db.collection("members").insertOne(member, function(err, result) {
                    assert.equal(err, null);
                    console.log("Inserted member a member into db.");
                    callback(err, result);
                    return;
                });
            }else{
                console.log("Faild to insert member.");
                callback(null, null);
                return;
            }
        }
    ]);
    
}


exports = module.exports = Cdb;
