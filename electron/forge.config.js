/* eslint-disable */
const os = require('os');
const path = require("path");

let icon;
// Overwrite with own img path like: res/img/[fav]icon.*

switch (os.platform()) {
  case 'linux': // need a *.png img
    icon = 'res/img/icon.png';
    break;
  case 'win32': // need a *.ico img
    icon = 'res/img/icon.ico';
    break;
  default:
    icon = 'res/img/icon.png';
}

const ignore = [
'.gitea',
'.idea',
'.vscode',
'config',
'^/src$',
'^/img$',
'^/frontend$',
'^/scripts',
'.eslintrc',
'.gitignore',
'.ncurc.json',
'.prettierrc',
'Jenkinsfile',
'tsconfig.json',
];

module.exports = {
  packagerConfig: {
    icon,
    ignore,
  },

  makers: [
    {
      platforms: ['linux','win32'],
      name: '@electron-forge/maker-zip'
    }
  ],
};
