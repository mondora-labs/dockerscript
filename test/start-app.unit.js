var BPromise = require("bluebird");
var R        = require("ramda");
var rewire   = require("rewire");
var should   = require("should");
var sinon    = require("sinon");

var script = rewire("../app/start-app.js");

describe("The createStartAndInfo function", function () {

    var createStartAndInfo = script.__get__("createStartAndInfo");

    var oldGetContainerPort = script.__get__("getContainerPort");
    var oldCreateContainer  = script.__get__("createContainer");
    var oldStartContainer   = script.__get__("startContainer");

    beforeEach(function () {
        var passThrough = function (ret) {
            return BPromise.resolve(ret);
        };
        script.__set__("getContainerPort", sinon.spy(passThrough));
        script.__set__("createContainer", sinon.spy(passThrough));
        script.__set__("startContainer", sinon.spy(passThrough));
    });

    afterEach(function () {
        script.__set__("getContainerPort", oldGetContainerPort);
        script.__set__("createContainer", oldCreateContainer);
        script.__set__("startContainer", oldStartContainer );
    });

    it("should return a thenable", function () {
        createStartAndInfo([]).then.should.be.type("function");
    });

    it("should call the three containers methods", function (done) {
        createStartAndInfo([1, 2, 3])
            .then(function () {
                var getContainerPortStub = script.__get__("getContainerPort");
                var createContainerStub  = script.__get__("createContainer");
                var startContainerStub   = script.__get__("startContainer");
                getContainerPortStub.callCount.should.equal(3);
                createContainerStub.callCount.should.equal(3);
                startContainerStub.callCount.should.equal(3);
                done();
            })
            .catch(done);
    });

});

describe("The filterByNames function", function () {

    var filterByNames = script.__get__("filterByNames");

    it("should return a filter function", function () {
        filterByNames().should.be.type("function");
    });

    describe("which", function () {
        it("should let through only elements of the array passed to it", function () {
            var n = function (name) {
                return {name: name};
            };
            var ff1 = filterByNames([1, 2, 3]);
            ff1([n(3), n(4), n(5)]).should.eql([n(3)]);
            var ff2 = filterByNames([]);
            ff2([n(1), n(2), n(3)]).should.eql([]);
        });
    });

});
