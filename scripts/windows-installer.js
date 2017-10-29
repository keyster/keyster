var electronInstaller = require('electron-winstaller');
resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: 'build/src/Keyster-win32-x64/',
    outputDirectory: 'build/src/',
    authors: 'Keyster',
    exe: 'keyster.exe',
    setupIcon: 'resources/img/icon.ico',
    iconUrl: 'https://keyster.io/img/logo.png',
  });

resultPromise.then(() => console.log("Windows installer created."), (e) => console.log(`Windows installer error: ${e.message}`));
