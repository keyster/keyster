mkdir -p build/out build/css
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
rm -r build/web
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
rm -r build/mobile
echo "=== Mobile build complete. ==="
rm -r build/lib
