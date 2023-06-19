const fs = require("node:fs");


function updateAppVersion() {
    //open constants.ts file
    const constantsPath = './src/constants/constants.ts';
    const constants = fs.readFileSync(constantsPath, 'utf8');
    const constantsLines = constants.split('\n');
    const versionLine = constantsLines.find(line => line.includes('VERSION'));
    const version = versionLine.split('\'')[1];
    const newVersion = version.split('.');
    newVersion[1] = parseInt(newVersion[1]) + 1;
    const newVersionString = newVersion.join('.');
    const newConstants = constants.replace(version, newVersionString);
    fs.writeFileSync(constantsPath, newConstants, 'utf8');
    console.log(`Updated version to ${newVersionString}`);
}

updateAppVersion();