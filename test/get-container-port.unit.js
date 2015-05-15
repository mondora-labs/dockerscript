var BPromise = require("bluebird");
var R        = require("ramda");
var rewire   = require("rewire");
var should   = require("should");
var sinon    = require("sinon");

var getContainerPort = rewire("../app/get-container-port.js");

describe("The getContainerPort function", function () {

    var oldRequest = getContainerPort.__get__("request");

    beforeEach(function () {
        var requestStub = sinon.spy(function () {
            return new BPromise(function (resolve, reject) {
                var res = {};
                var body = {
                    NetworkSettings: {
                        Ports: {
                            "80/tcp": [{
                                "HostPort": "49153"
                            }]
                        }
                    }
                };
                resolve([res, body]);
            });
        });
        getContainerPort.__set__("request", requestStub);
    });
    afterEach(function () {
        getContainerPort.__set__("request", oldRequest);
    });

    it("should contruct a request object from parameters", function () {
        var container = R.mixin(testData.container, {reachable: true});
        getContainerPort(container);
        var actual = getContainerPort.__get__("request").getCall(0).args[0];
        actual.should.eql(testData.expected);
    });

    it("should return a promise which resolves with a container", function (done) {
        var container = R.mixin(testData.container, {reachable: true});
        getContainerPort(container)
            .then(function (rcontainer) {
                R.mixin(container, {port: "49153"}).should.eql(rcontainer);
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
        "subdomain": "sub",
        "reachable": true
    },
    "expected": {
        "uri": "http://127.0.0.1:2375/containers/someId/json",
        "method": "GET",
        "json": true
    }
};
