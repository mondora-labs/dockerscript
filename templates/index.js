var fs         = require("fs");
var Handlebars = require("handlebars");

module.exports = {
    base: Handlebars.compile(
        fs.readFileSync("./templates/base.hbs", "utf8")
    )
};
