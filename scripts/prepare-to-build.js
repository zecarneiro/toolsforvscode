'use strict';
var fs = require("fs");
var path = require("path");

var DIST_DIR = "./dist";

var resolvePath = (strPath) => {
    return path.resolve(strPath);
};
var PrepareUtils = require(resolvePath('./src/utils/scripts/prepare-utils'));

var main = () => {
    if (fs.existsSync(DIST_DIR)) {
        console.log("> Clean dist directory");
        fs.rmdirSync(DIST_DIR, { recursive: true });
    }
    PrepareUtils(process.cwd(), `${process.cwd()}/src/utils`);
};
main();