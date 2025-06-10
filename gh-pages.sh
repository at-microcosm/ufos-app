#!/bin/bash
set -euo pipefail
set +x

git switch gh-pages
git merge --no-ff main -m 'merge main'

npm run just-build
cp docs/CNAME dist/
rm -fr docs
mv dist docs

mkpage () {
  local page=$1
  mkdir -p "docs${page}"
  cp docs/index.html "docs${page}/index.html"
}

mkpage /all
mkpage /collection
mkpage /status

git add docs
git commit -m 'update build'
git push
git switch -
