'use strict';
const fse = require('fs-extra');
const DIST_DIR = './dist';
const main = () => {
  if (fse.existsSync(DIST_DIR)) {
    console.log('> Clean dist directory');
    fse.rmdirSync(DIST_DIR, { recursive: true });
  }
};
main();
