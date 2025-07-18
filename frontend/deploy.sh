echo "Switching to branch main"
git checkout main

echo "Building app..."
npm run build

echo "Deploying files to server..."
scp -r ./dist/* zoey@128.199.6.175:/var/www/zoeysalvesen.com/html/shibachat

echo "Done"