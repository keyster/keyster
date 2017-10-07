mkdir -p build/out build/css build/src
scss --sourcemap=none resources/bulma/sass/keyster.scss build/css/bulma.min.css --style compressed
cp -r resources/lib build/lib
echo "=== Deploying database and functions to Firebase... ==="
cd firebase
cd functions && npm install && cd ..
firebase deploy --token ${token} --only database,functions
cd ..
echo "=== Firebase deploy complete. ==="
echo "=== Deploying web app to Firebase... ==="
cp -r web build/web
cp build/css/* build/web/public/css
cp -r build/lib web/public/lib
cd build/web
firebase deploy --token ${token} --only hosting
cd ../../
echo "=== Web deploy complete. ==="
echo "=== Building mobile app... ==="
cp -r mobile build/mobile
cp build/css/* build/mobile/www/css
cp -r build/lib build/mobile/www/lib
cd build/mobile
cordova platforms add android
cordova build --release
cd ../..
cp build/mobile/platforms/android/build/outputs/apk/android-release-unsigned.apk build/out/keyster.apk
echo "=== Mobile build complete. ==="
echo "=== Building Electron app... ==="
cp -r desktop build/desktop
cp build/css/* build/desktop/css
cp -r build/lib build/desktop/lib
cd build/desktop && npm install && cd ../..
electron-packager build/desktop --platform linux --arch x64 --out build/src/
electron-installer-debian --src build/src/Keyster-linux-x64/ --dest build/out/ --arch amd64
electron-packager build/desktop --platform darwin --arch x64 --out build/src/
cp -r build/src/Keyster-darwin-x64/Keyster.app build/out/Keyster.app
electron-packager build/desktop --platform win32 --arch x64 --out build/src
cd scripts && npm install && cd ..
node scripts/windows-installer.js
cp build/src/Setup.exe build/out/KeysterSetup.exe
rm -r build/src
echo "=== Electron build complete. ==="
rm -r build/lib build/css
