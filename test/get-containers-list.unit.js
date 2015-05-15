var BPromise = require("bluebird");
var R        = require("ramda");
var rewire   = require("rewire");
var should   = require("should");
var sinon    = require("sinon");

var getContainersList = rewire("../app/get-containers-list.js");

describe("The getContainersList function", function () {

    it("should return an array of containers decorated with the app properties", function () {
        var actual = getContainersList(testData.appConfig);
        actual.should.eql(testData.expected);
    });

});

var testData = {
    "appConfig": {
        "name": "app",
        "domain": "app.com",
        "containers": [{
            "id": "someId",
            "image": "mongo",
            "name": "db",
            "reachable": false
        }]
    },
    "expected": [{
        "app": {
            "name": "app",
            "domain": "app.com"
        },
        "id": "someId",
        "image": "mongo",
        "name": "db",
        "reachable": false
    }]
};
