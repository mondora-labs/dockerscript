var BPromise = require("bluebird");
var fs       = require("fs");
var R        = require("ramda");
var request  = BPromise.promisify(require("request"));

var templates = require("../templates");

var createContext = function (container) {
    var subdomain = container.subdomain ? container.subdomain + "." : "";
    var domain = subdomain + container.app.domain;
    var path = container.path ? container.path : "/";
    return {
        appName: container.app.name,
        containerNames: [container.name],
        domain: domain,
        sslDomain: container.app.domain,
        ssl: container.ssl,
        locations: [{
            target: container.port,
            useBasicAuth: container.useBasicAuth,
            path: path
        }]
    };
};

var aggregateContextsByDomain = function (contextsList) {
    return R.pipe(
        R.reduce(function (acc, context) {
            var newAcc = {};
            if (acc[context.domain]) {
                var newContext = R.cloneObj(acc[context.domain]);
                newContext.containerNames.push(context.containerNames[0]);
                newContext.locations.push(context.locations[0]);
                newAcc[context.domain] = newContext;
            } else {
                newAcc[context.domain] = context;
            }
            return R.mixin(acc, newAcc);
        }, {}),
        R.values
    )(contextsList);
};

var compileConfigs = function (contextsList) {
    return R.map(function (context) {
        return {
            name: context.appName + ":" + context.containerNames.join("+"),
            content: templates.base(context)
        };
    }, contextsList);
};

var createConfigs = function (containersList) {
    return BPromise.resolve(R.pipe(
        R.filter(R.propEq("reachable", true)),
        R.map(createContext),
        aggregateContextsByDomain,
        compileConfigs
    )(containersList));
};

var writeConfigs = function (configs) {
    //TODO make async to keep all the chain async
    try {
        fs.mkdirSync("./out/");
    } catch (ignore) {
        // Directory exists, ignore
    }
    R.forEach(function (config) {
        fs.writeFileSync("./out/" + config.name, config.content, "utf8");
    }, configs);
};

module.exports = function writeNginxConf (containersListPromise) {
    return containersListPromise
        .then(createConfigs)
        .then(writeConfigs);
};
