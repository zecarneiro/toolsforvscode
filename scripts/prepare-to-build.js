'use strict';
const fse = require("fs-extra");
const path = require("path");
const DIST_DIR = "./dist";
const resolvePath = (strPath) => {
    return path.resolve(strPath);
};
const filterFunc = (src, dest) => {
    if (src && src.includes('prepare-to-build.js')) {
        return false;
    }
    return true;
};
var utilsDirectory = resolvePath('./sub-projects/utils');

var main = () => {
    if (fse.existsSync(DIST_DIR)) {
        console.log("> Clean dist directory");
        fse.rmdirSync(DIST_DIR, { recursive: true });
    }
    console.log("> Copy files directory from subproject");
    fse.copySync(resolvePath(utilsDirectory + '/files'), resolvePath("./files"), { recursive: true });
};
main();