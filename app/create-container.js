var BPromise = require("bluebird");
var R        = require("ramda");
var request  = BPromise.promisify(require("request"));

var constants = require("../constants.js");

var maybeAppendSlash = function (string) {
    return [
        string,
        (string[string.length - 1] === "/" ? "" : "/")
    ].join("");
};
var DOCKER_VOLUMES_DIRECTORY = maybeAppendSlash(
    process.env.DOCKER_VOLUMES_DIRECTORY || "/volumes/"
);

module.exports = function createContainer (container) {
    var getEnv = function (env) {
        return env.key + "=" + env.value;
    };
    var getVolume = function (volume) {
        var hostDir = DOCKER_VOLUMES_DIRECTORY + container.app.name + volume.host;
        var guestDir = volume.guest;
        return hostDir + ":" + guestDir;
    };
    var getLink = function (link) {
        var target = container.app.name + "." + link.target;
        var alias = link.alias;
        return target + ":" + alias;
    };
    // Build the HTTP request body object
    // See http://docs.docker.com/reference/api/docker_remote_api/
    // for the docker API documentation
    var body = {
        Env: R.map(getEnv, container.env || []),
        Image: container.image,
        HostConfig: {
            Binds: R.map(getVolume, container.volumes || []),
            Links: R.map(getLink, container.links || []),
            PublishAllPorts: container.reachable
        }
    };
    // Make the request
    return request({
        uri: constants.DOCKER_DAEMON + "/containers/create",
        method: "POST",
        qs: {
            name: container.app.name + "." + container.name
        },
        json: body
    }).spread(function (response, body) {
        // Sets the container state by parsing the response
        // See http://docs.docker.com/reference/api/docker_remote_api/
        // for the docker API documentation
        return BPromise.resolve(
            R.mixin(container, {id: body.Id})
        );
    });
};
