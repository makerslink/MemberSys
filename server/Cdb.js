var acl = require('acl');
var assert = require('assert')
var async = require('async')

var Cdb = function (db){
    this.db = db;
    this.acl = new acl(new acl.mongodbBackend(db, "acl"));
    //Add that public is allowed to add members...
    this.acl.allow("public", "members", ["add", "view-public"]);
    //this.acl.removeAllow("public", "members", "add");
    this.acl.allow("member", "members", ["view", "view-public", "view-members"]);
    this.acl.addUserRoles("larlin", "member");
}

// Create a Controlled db that is controlled by ACL.

Cdb.prototype.setRequiredFields = function(fields){
    this.requiredFields = fields;
}
Cdb.prototype.addMember = function(callback, member){
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
    
    callback(null, null);
}

Cdb.prototype.getMember = function(callback, user, member){
    //Bind locally for callbacks...
    
    var alloved = false;
    var acl = this.acl;
    var viewPermissions = new Array();
    var db = this.db;
    var members;
    async.series([
        function(callback){
            acl.isAllowed(user, "members", "view", function(err, res){
                alloved = res;
                callback(err, alloved);
            });
        },
        function(callback){
            if(alloved){
                acl.allowedPermissions(user, "members", function(err, res){
                    var permissions = res["members"];
                    for(i in res["members"]){
                        if(permissions[i].indexOf("view-")>=0){
                            viewPermissions.push(permissions[i].split("-")[1]);
                        }
                    }
                    callback(err, viewPermissions);
                });
            }else{
                callback(null, null);
                return;
            }
        },
        function(callback){
            if(alloved){
                console.log(viewPermissions);
                //This fetches all members and their data with the visibilities that are in viewPermissions...
                //TODO: implement search for a member with respect to some search parameter (e.g. email)
                db.collection("members").aggregate([{$unwind: "$fields"},
                                                    {$match: {"fields.visibility":{$in:["public","members"]}}},
                                                    {$group:{_id:"$_id",fields:{$addToSet: "$fields"}}}],function(err, result) {
                    for(row in result){
                        console.log(result[row]);
                    }
                    members = result;
                    callback(err, result);
                    return;
                });
            }else{
                callback(null, null);
                return;
            }
        },
        function(callback){
            if(alloved && members != null){
                for(row in members){
                    console.log(members[row]);
                }
            }
        }
    ]);
}


exports = module.exports = Cdb;
