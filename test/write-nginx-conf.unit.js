var BPromise = require("bluebird");
var R        = require("ramda");
var rewire   = require("rewire");
var should   = require("should");
var sinon    = require("sinon");

var writeNginxConf = rewire("../app/write-nginx-conf.js");

describe("The createContext function", function () {
    it("should call generate a context from the container", function () {
        var createContext = writeNginxConf.__get__("createContext");
        var container = {
            app: {
                name: "app",
                domain: "app.com"
            },
            id: "someId",
            image: "mongo",
            name: "db",
            subdomain: "sub",
            path: "/path",
            reachable: true,
            port: 4000
        };
        var actual = createContext(container);
        actual.should.eql({
            containerNames: ["db"],
            appName: "app",
            domain: "sub.app.com",
            sslDomain: "app.com",
            ssl: undefined,
            locations: [{
                target: 4000,
                useBasicAuth: undefined,
                path: "/path"
            }]
        });
    });
});

describe("The aggregateContextsByDomain function", function () {
    it("should aggregate conexts by domain", function () {
        var aggregateContextsByDomain = writeNginxConf.__get__("aggregateContextsByDomain");
        var actual = aggregateContextsByDomain([
            {
                containerNames: ["db"],
                domain: "sub.app.com",
                sslDomain: "app.com",
                ssl: undefined,
                locations: [{
                    target: 4000,
                    useBasicAuth: undefined,
                    path: "/path"
                }]
            },
            {
                containerNames: ["api"],
                domain: "sub.app.com",
                sslDomain: "app.com",
                ssl: undefined,
                locations: [{
                    target: 5000,
                    useBasicAuth: undefined,
                    path: "/anotherPath"
                }]
            },
            {
                containerNames: ["app"],
                domain: "app.com",
                sslDomain: "app.com",
                ssl: undefined,
                locations: [{
                    target: 5000,
                    useBasicAuth: undefined
                }]
            }
        ]);
        actual.should.eql([
            {
                containerNames: ["db", "api"],
                domain: "sub.app.com",
                sslDomain: "app.com",
                ssl: undefined,
                locations: [
                    {
                        target: 4000,
                        useBasicAuth: undefined,
                        path: "/path"
                    },
                    {
                        target: 5000,
                        useBasicAuth: undefined,
                        path: "/anotherPath"
                    }
                ]
            },
            {
                containerNames: ["app"],
                domain: "app.com",
                sslDomain: "app.com",
                ssl: undefined,
                locations: [{
                    target: 5000,
                    useBasicAuth: undefined
                }]
            }
        ]);
    });
});

describe("The compileConfigs function", function () {
    it("should produce configs objects", function () {
        var compileConfigs = writeNginxConf.__get__("compileConfigs");
        var actual = compileConfigs([
            {
                appName: "app",
                containerNames: ["db", "api"],
                domain: "sub.app.com",
                sslDomain: "app.com",
                ssl: undefined,
                locations: [
                    {
                        target: 4000,
                        useBasicAuth: undefined,
                        path: "/path"
                    },
                    {
                        target: 5000,
                        useBasicAuth: undefined,
                        path: "/anotherPath"
                    }
                ]
            },
            {
                appName: "app",
                containerNames: ["app"],
                domain: "app.com",
                sslDomain: "app.com",
                ssl: undefined,
                locations: [{
                    target: 5000,
                    useBasicAuth: undefined
                }]
            }
        ]);
        actual[0].name.should.eql("app:db+api");
        actual[1].name.should.eql("app:app");
    });
});

describe("The createConfigs function", function () {

    var createConfigs = writeNginxConf.__get__("createConfigs");

    it("should return a promise", function () {
        var containersList = [
            {
                app: {
                    name: "app",
                    domain: "app.com"
                },
                id: "someId",
                image: "mongo",
                name: "db",
                subdomain: "sub",
                path: "/path",
                reachable: true,
                port: 4000
            },
            {
                app: {
                    name: "app",
                    domain: "app.com"
                },
                id: "someId",
                image: "mongo",
                name: "db",
                subdomain: "sub",
                path: "/anotherPath",
                reachable: true,
                port: 4000
            }
        ];
        var actual = createConfigs(containersList);
        actual.then.should.be.type("function");
    });

    it("should resolve to an array of config objects", function (done) {
        var containersList = [
            {
                app: {
                    name: "app",
                    domain: "app.com"
                },
                id: "someId",
                image: "mongo",
                name: "db",
                subdomain: "sub",
                path: "/path",
                reachable: true,
                port: 4000
            },
            {
                app: {
                    name: "app",
                    domain: "app.com"
                },
                id: "someId",
                image: "mongo",
                name: "api",
                subdomain: "sub",
                path: "/anotherPath",
                reachable: true,
                port: 4000
            }
        ];
        createConfigs(containersList).then(function (configsList) {
            try {
                R.is(Array, configsList).should.equal(true);
                R.is(String, configsList[0].name).should.equal(true);
                R.is(String, configsList[0].content).should.equal(true);
                configsList[0].name.should.equal("app:db+api")
            } catch (e) {
                return done(e);
            }
            done();
        });
    });

});

describe("The writeConfigs function", function () {

    var writeConfigs = writeNginxConf.__get__("writeConfigs");

    beforeEach(function () {
        var fs = writeNginxConf.__get__("fs");
        sinon.stub(fs, "mkdirSync");
        sinon.stub(fs, "writeFileSync");
    });
    afterEach(function () {
        var fs = writeNginxConf.__get__("fs");
        fs.mkdirSync.restore();
        fs.writeFileSync.restore();
    });

    it("should write to filesystem", function () {
        var fs = writeNginxConf.__get__("fs");
        writeConfigs([{
            name: "name",
            content: "content"
        }]);
        fs.mkdirSync.getCall(0).args[0].should.eql("./out/");
        fs.writeFileSync.getCall(0).args[0].should.eql("./out/name");
        fs.writeFileSync.getCall(0).args[1].should.eql("content");
    });

});
