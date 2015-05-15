var BPromise = require("bluebird");
var R        = require("ramda");
var request  = BPromise.promisify(require("request"));

var constants = require("../constants.js");

module.exports = function getContainerPort (container) {
    if (!container.reachable) {
        return BPromise.resolve(container);
    }
    console.log("Getting ports for container %s (%s)", container.id, container.name);
    return request({
        uri: constants.DOCKER_DAEMON + "/containers/" + container.id + "/json",
        method: "GET",
        json: true
    }).spread(function (response, body) {
        var ports = body.NetworkSettings.Ports;
        console.log("Ports for container %s (%s):", container.id, container.name);
        console.log(ports);
        var keys = Object.keys(ports);
        // Only one port per container can be exposed
        var port = ports[keys[0]][0].HostPort;
        return BPromise.resolve(
            R.mixin(container, {port: port})
        );
    }).catch(function (e) {
        console.error("Error occurred getting ports for container %s (%s)", container.id, container.name);
        console.error(e);
        return BPromise.resolve(container);
    });
};
