$version=node -p "require('./package.json').version"
makensis.exe /DBASE=$PWD /DVERSION=$version .\scripts\install.nsi
