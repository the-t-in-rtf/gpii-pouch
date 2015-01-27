// Utility functions to spin up pouch.
"use strict";
var fluid     = require('infusion');
var namespace = "gpii.pouch";
var pouch     = fluid.registerNamespace(namespace);
var when      = require("when");
var path      = require("path");

pouch.addRoutesPrivate = function(that) {
    if (!that.model.path) {
        console.error("You must configure a model.path for a gpii.express.router grade...");
        return null;
    }

    if (!that.model.router) {
        console.error("Our router must be configured before we attempt to add our routes.");
        return null;
    }

    var PouchDB    = require('pouchdb');
    var MemPouchDB = PouchDB.defaults({db: require('memdown')});

    if (that.model.databases && Object.keys(that.model.databases).length > 0) {
        Object.keys(that.model.databases).forEach(function(key){
            var dbConfig = that.model.databases[key];
            var db = new MemPouchDB(key);
            if (dbConfig.data) {
                var dataPath = path.resolve(__dirname, dbConfig.data);
                var data     = require(dataPath);
                db.bulkDocs(data);
            }
        });
    }

    that.model.router.use(that.model.path, require('express-pouchdb')(MemPouchDB));
};

/*
    The 'databases' option is expected to be an array keyed by dbName, with options to control whether data is loaded or not, as in:

    databases: {
        "nodata": {},
        "data":   { "data": "../tests/data/records.json" }
    }
 */
fluid.defaults(namespace, {
    gradeNames: ["fluid.standardRelayComponent", "gpii.express", "autoInit"],
    model: {
        config:    null,
        router:    null,
        path:      "/",
        databases: {}
    },
    components: {
        "session": {
            type: "gpii.pouch.tests.session"
        }
    },
    listeners: {
        "addRoutes": {
            funcName: namespace + ".addRoutesPrivate",
            args: ["{that}"]
        }
    }
});

