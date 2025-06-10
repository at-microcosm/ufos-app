#!/bin/bash
set -euo pipefail
set +x

git switch gh-pages
git merge --no-ff main -m 'merge main'

npm run gh-pages

git add docs
git commit -m 'update build'
git push
git switch -
