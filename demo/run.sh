cd ../external-services
sh start-all.hs
cd ..

nvm use
npm install
rm -rf output
npm run start -- -Y