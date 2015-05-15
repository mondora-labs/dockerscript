var BPromise = require("bluebird");
var R        = require("ramda");

var writeNginxConf = require("./write-nginx-conf.js");

var createContainer = require("./create-container.js");
var startContainer = require("./start-container.js");
var getContainerPort = require("./get-container-port.js");

var createStartAndInfo = function (containersList) {
    var promiseValues = [];
    var promiseGetters = getPromiseGetters(containersList);
    var allDonePromise = R.reduce(function (acc, promiseGetter) {
        return acc
            .then(promiseGetter)
            .then(function (container) {
                promiseValues.push(container);
                return BPromise.resolve();
            });
    }, BPromise.resolve(), promiseGetters);
    return allDonePromise.then(function () {
        return BPromise.resolve(promiseValues);
    });
};

var getPromiseGetters = R.map(function (container) {
    return function () {
        return BPromise.resolve(container)
            .then(createContainer)
            .then(startContainer)
            .then(getContainerPort);
    };
});

var filterByNames = function (containersNames) {
    return R.filter(R.compose(
        R.rPartial(R.contains, containersNames),
        R.prop("name")
    ));
};

module.exports = function startApp (containersList, containersNames) {
    var pipeline = R.pipe(
        filterByNames(containersNames),
        createStartAndInfo,
        writeNginxConf
    );
    return pipeline(containersList);
};
