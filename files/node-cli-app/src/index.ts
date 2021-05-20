#!/usr/bin/env node
/**-----------------------------------------------------------------------------------------------------------------------
 * !                                                     INFO
 * For more informations, see the image on /root/files/create-your-own-typescript-cli-with-node-js
 *-----------------------------------------------------------------------------------------------------------------------**/
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const path = require('path');
const program = require('commander');

function prepareHelp() {
   program
      .version('1.0.0')
      .description("An example CLI for ordering my-cli-app")
      .option('-c, --clear', 'Clear Screen')
      .parse(process.argv);
}

function main() {
   // Init
   console.log(
      chalk.red(figlet.textSync('my-cli-app', { horizontalLayout: 'full' }))
   );
   prepareHelp();

   // Run
   if (!program.clear && !process.argv.slice(2).length) {
      program.outputHelp();
   } else if (program.clear) {
      clear();
   }
}
main();