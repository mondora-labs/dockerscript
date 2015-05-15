var BPromise = require("bluebird");
var R        = require("ramda");
var rewire   = require("rewire");
var should   = require("should");
var sinon    = require("sinon");

var getContainersNames = rewire("../app/get-containers-names.js");

describe("The getContainersNames function", function () {

    it("if called with an array, should return the array", function () {
        var arr = [1,2,3];
        var actual = getContainersNames(arr);
        actual.should.equal(arr);
    });

    it("if called with a non array, should return an array of all containers names", function () {
        var containersList = [{name: 1}, {name: 2}];
        var actual = getContainersNames(undefined, containersList);
        actual.should.eql([1,2]);
    });

});
