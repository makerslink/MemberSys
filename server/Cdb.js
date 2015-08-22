"use strict";

var acl = require('acl');
var assert = require('assert')
var async = require('async')

var Cdb = function (db){
    this.db = db;
    this.acl = new acl(new acl.mongodbBackend(db, "acl"));
}

// Create a Controlled db that is controlled by ACL.
Cdb.prototype.configure = function(callback){
    var acl = this.acl;
    var db = this.db;
    
    //All permissions and roles used...
    var permissions = ["add", "view", "view-private", "view-members", "view-assoc-members", "view-public", "edit", ];
    var resources = ["members", "roles"];
    
    async.series([
        function(callback){
            //Add that public is allowed to add members...
            //TODO: Public should only be allowed to add a new member without
            //      any special permissions
            acl.allow("public", "members", ["add", "view-public"], callback);
        },
        //function(callback){
        //    this.acl.removeAllow("public", "members", "add", callback);
        //},
       function(callback){
            //Administrators can do everything...
            acl.allow("admin", resources, permissions, callback);
        },
        function(callback){
            //Add that members can view members and their member public data...
            acl.allow("member", "members", ["view", "view-public", "view-members"], callback);
        },
        function(callback){
            //TODO: Move the init to something that is only runned once when the database i set up.
            db.collection("members").createIndex({"fields.value":"text"}, callback);
        }
    ],function(err, result){
        callback();
    });
}
Cdb.prototype.setRequiredFields = function(fields){
    this.requiredFields = fields;
}
Cdb.prototype.addMember = function(member, callback){
    for(field in this.requiredFields){
        if (!(field in member) || member[field].trim().length == 0){
            //The required field dosen't exist or is a empty string.
            //TODO:Throw a error in some way...
        }
    }
    
    for(var field in member){
        if (!("visibility" in member[field])){
            //Add default visibility
            member[field]["visibility"] = "private";
        }
    }
    //Bind locally for callbacks...
    var db = this.db;
    
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

Cdb.prototype.getMember = function(user, member, callback){
    //Bind locally for callbacks...
    
    var acl = this.acl;
    var db = this.db;
    async.waterfall([
        function(callback){
            acl.isAllowed(user, "members", "view", function(err, res){
                if(res){
                    callback(err);
                    return;
                }else{
                    callback(new Error("User have insuffiecent permission for this operation."));
                    return;
                }
            });
        },
        function(callback){
            acl.allowedPermissions(user, "members", function(err, res){
                var permissions = res["members"];
                var viewPermissions = new Array();
                for(var i in res["members"]){
                    if(permissions[i].indexOf("view-")>=0){
                        viewPermissions.push(permissions[i].split("-")[1]);
                    }
                }
                
                if(viewPermissions.length > 0 && err == null){
                    callback(err, viewPermissions);
                }else{
                    callback(new Error("User have insuffiecent permission for this operation."), viewPermissions);
                }
                
                
            });
        },
        function(viewPermissions, callback){
            //This fetches all members and their data with the visibilities that are in viewPermissions...
            db.collection("members").aggregate(
                [{$match: {$text:{$search:member}}},
                {$unwind: "$fields"},
                {$match: {"fields.visibility":{$in:viewPermissions}}},
                {$group:{_id:"$_id",fields:{$addToSet: "$fields"}}}],
                function(err, result) {
                    callback(err, result);
                    return;
                }
            );
        }
    ], function(err, result){
        callback(err, result);
        return;
    });
}

Cdb.prototype.addRole = function(user, member, role, callback){
    var acl = this.acl;
	async.waterfall([
		function(callback){
			acl.isAllowed(user, "role", "add", function(err, res){
				if(res){
					callback(err);
					return;
				}else{
					callback(new Error("User have insuffiecent permission for this operation."));
					return;
				}
			})
		},
		function(callback){
			acl.addUserRoles(member, role, callback)
		}
	], function(err, result){
        callback(err, result);
        return;
    });
}

Cdb.prototype.addFirstAdmin = function(member, callback){
    var acl = this.acl;
    async.waterfall([
        function(callback){
            acl.roleUsers("admin", function(err, users){
                if(users.length != 0){
                    err = new Error("There is already a admin.");
                }
                callback(err);
            })
        },
        function(callback){
            acl.addUserRoles(member, "admin", callback);
        }
    ], function(err, result){
        callback(err, result);
        return;
    });
}

exports = module.exports = Cdb;
