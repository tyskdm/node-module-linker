### publish.sh ###
echo "== publish.sh =="
pwd
whoami
source ~/.nvm/nvm.sh
nvm install 0.10
echo "== npm publish =="
npm publish
echo "== git push github =="



