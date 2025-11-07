/* eslint-disable */
const os = require('os');

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
'^/dev',
'.eslintrc',
'.gitignore',
'.ncurc.json',
'.prettierrc',
'Jenkinsfile',
'res/*.yml',
'tsconfig.json',
'makeWin32Installer.ps1',
'.eslintignore',
];

module.exports = {
  packagerConfig: {
    icon,
    ignore,
  },

  makers: [
    {
      platforms: ['linux'],
      name: '@electron-forge/maker-zip'
    },
    {
      platforms: ['linux'],
      name: '@electron-forge/maker-deb',
      config: {
          options: {
              maintainer: 'Elschnagoo',
              homepage: 'https://the-madhouse.eu/'
          }
      }
    },
    {
      platforms: ["win32"],
      name: '@electron-forge/maker-squirrel',
      config: {
        authors: 'Elschnagoo',
        description: 'WoW Character Inspector',
        setupIcon: "./res/img/icon.ico",
        loadingGif: "./res/img/install.gif"
      }
    }
  ],
};
