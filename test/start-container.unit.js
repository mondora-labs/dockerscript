var BPromise = require("bluebird");
var R        = require("ramda");
var rewire   = require("rewire");
var should   = require("should");
var sinon    = require("sinon");

var startContainer = rewire("../app/start-container.js");

describe("The startContainer function", function () {

    var oldRequest = startContainer.__get__("request");

    beforeEach(function () {
        var requestStub = sinon.spy(function () {
            return new BPromise(function (resolve, reject) {
                resolve([{}, {Id: "someId"}]);
            });
        });
        startContainer.__set__("request", requestStub);
    });
    afterEach(function () {
        startContainer.__set__("request", oldRequest);
    });

    it("should contruct a request object from parameters", function () {
        var container = testData.container;
        startContainer(container);
        var actual = startContainer.__get__("request").getCall(0).args[0];
        actual.should.eql(testData.expected);
    });

    it("should return a promise which resolves with a container", function (done) {
        var container = testData.container;
        startContainer(container)
            .then(function (rcontainer) {
                container.should.eql(rcontainer);
                done();
            })
            .catch(done);
    });

});

var testData = {
    "container": {
        "app": {
            "name": "app",
            "domain": "app.com"
        },
        "id": "someId",
        "image": "mongo",
        "name": "db",
        "reachable": false
    },
    "expected": {
        "uri": "http://127.0.0.1:2375/containers/someId/start",
        "method": "POST"
    }
};
