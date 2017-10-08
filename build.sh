[ -d build ] && rm -r build
mkdir -p build/css
scss --sourcemap=none resources/bulma/sass/keyster.scss build/css/bulma.min.css --style compressed
cp resources/css/* build/css
cp -r resources/lib build/lib
echo "=== Building mobile app... ==="
cp -r mobile build/mobile
cp build/css/* build/mobile/www/css
cp -r build/lib build/mobile/www/lib
cd build/mobile
cordova platforms add android
cordova build --release
cd ../..
cp build/mobile/platforms/android/build/outputs/apk/*.apk build/out/keyster.apk
echo "=== Mobile build complete. ==="
echo "=== Building Electron app... ==="
cp -r desktop build/desktop
cp build/css/* build/desktop/css
cp -r build/lib build/desktop/lib
cd build/desktop && npm install && cd ../..
electron-packager build/desktop --platform linux --arch x64 --out build/src/
electron-installer-debian --src build/src/Keyster-linux-x64/ --dest build/out/ --arch amd64
electron-packager build/desktop --platform darwin --arch x64 --out build/src/
zip -q -r build/out/KeysterMac.zip build/src/Keyster-darwin-x64/Keyster.app
electron-packager build/desktop --platform win32 --arch x64 --out build/src
cd scripts && npm install && cd ..
node scripts/windows-installer.js
cp build/src/Setup.exe build/out/KeysterSetup.exe
rm -r build/src
echo "=== Electron build complete. ==="
rm -r build/lib build/css
