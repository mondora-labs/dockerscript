var fs = require("fs");
var R  = require("ramda");

var containersList = require("./app/get-containers-list.js")(JSON.parse(
    fs.readFileSync(process.argv[2], "utf8")
));
var containersNames = require("./app/get-containers-names.js")(
    process.argv[3] && process.argv[3].split(","),
    containersList
);

require("./app/start-app.js")(containersList, containersNames);
