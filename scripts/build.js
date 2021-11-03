#!/usr/bin/env node
'use strict';
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fse = require('fs-extra');
const childProcess = require('child_process');

yargs(hideBin(process.argv))
  .command({
    command: 'build <mode>',
    desc: 'Build project',
    builder: (args) => {
      return args.positional('mode', {
        describe: 'Type of build',
        default: 'prodution',
        choices: ['prodution', 'dev'],
        demandOption: false,
      });
    },
    handler: (argv) => {
      const distDir = './dist';
      if (fse.existsSync(distDir)) {
        console.log('> Clean dist directory');
        fse.rmdirSync(distDir, { recursive: true });
      }
      const options = { stdio: 'inherit', shell: true };
      childProcess.spawnSync('npm', ['run', 'lint:fix'], options);
      if (argv.mode === 'prodution') {
        console.log('> Build prodution mode');
        childProcess.spawnSync('npx', [
          'webpack',
          '--mode',
          'production',
          '--devtool',
          'hidden-source-map',
          '--config',
          './node-extension.webpack.config.js',
        ], options);
      } else {
        console.log('> Build dev mode');
        childProcess.spawnSync('tsc', ['-p', 'tsconfig.json'], options);
      }
    },
  })
  .parse();
