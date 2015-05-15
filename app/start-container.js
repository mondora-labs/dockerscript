var BPromise = require("bluebird");
var request  = BPromise.promisify(require("request"));

var constants = require("../constants.js");

module.exports = function startContainer (container) {
    return request({
        uri: constants.DOCKER_DAEMON + "/containers/" + container.id + "/start",
        method: "POST"
    }).then(function () {
        return BPromise.resolve(container);
    });
};
