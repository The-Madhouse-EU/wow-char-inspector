/* eslint-disable */
const reactConfigs = require('./webpack.react.js');

let mode = null;

mode=reactConfigs

const env = process.env.BUILD;

if (env === 'development') {
  console.log('Webpack - DEV MODE');
  mode.mode = 'development';
} else {
  // mode.devtool =  undefined;
  console.log('Webpack - PRODUCTION MODE');
}

module.exports = [mode];
