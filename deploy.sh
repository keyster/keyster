[ -d build ] && rm -r build
mkdir -p build/css
scss --sourcemap=none resources/bulma/sass/keyster.scss build/css/bulma.min.css --style compressed
cp resources/css/* build/css
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
rm -r build
