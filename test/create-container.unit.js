var BPromise = require("bluebird");
var R        = require("ramda");
var rewire   = require("rewire");
var should   = require("should");
var sinon    = require("sinon");

var createContainer = rewire("../app/create-container.js");

describe("The createContainer function", function () {

    var oldRequest = createContainer.__get__("request");

    beforeEach(function () {
        var requestStub = sinon.spy(function () {
            return new BPromise(function (resolve, reject) {
                resolve([{}, {Id: "someId"}]);
            });
        });
        createContainer.__set__("request", requestStub);
    });
    afterEach(function () {
        createContainer.__set__("request", oldRequest);
    });

    it("should contruct a request object from parameters", function () {
        var container = testData.container;
        createContainer(container);
        var actual = createContainer.__get__("request").getCall(0).args[0];
        actual.should.eql(testData.expected);
    });

    it("should return a promise which resolves with a container", function (done) {
        var container = testData.container;
        createContainer(container)
            .then(function (rcontainer) {
                R.mixin(container, {id: "someId"}).should.eql(rcontainer);
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
        "image": "mongo",
        "name": "db",
        "volumes": [
            {
                "host": "/data/db",
                "guest": "/data/db"
            },
            {
                "host": "/var/db",
                "guest": "/var/db"
            }
        ],
        "links": [
            {
                "target": "db",
                "alias": "db"
            },
            {
                "target": "redis",
                "alias": "redis"
            }
        ],
        "env": [
            {
                "key": "key_1",
                "value": "val_1"
            },
            {
                "key": "key_2",
                "value": "val_2"
            }
        ],
        "reachable": false
    },
    "expected": {
        "uri": "http://127.0.0.1:2375/containers/create",
        "method": "POST",
        "qs": {
            "name": "app.db"
        },
        "json": {
            "Env": [
                "key_1=val_1",
                "key_2=val_2"
            ],
            "Image": "mongo",
            "HostConfig": {
                "Binds": [
                    "/volumes/app/data/db:/data/db",
                    "/volumes/app/var/db:/var/db"
                ],
                "Links": [
                    "app.db:db",
                    "app.redis:redis"
                ],
                "PublishAllPorts": false
            }
        }
    }
};
