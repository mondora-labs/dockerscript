var R = require("ramda");

module.exports = function getContainersList (appConfig) {
    return R.map(function (container) {
        return R.mixin(container, {
            app: R.pick(["name", "domain"], appConfig)
        });
    }, appConfig.containers);
};
