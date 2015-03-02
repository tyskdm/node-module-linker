echo "== regression-test.sh =="
pwd
whoami
source ~/.nvm/nvm.sh
nvm install 0.10
npm install
npm test
grunt
