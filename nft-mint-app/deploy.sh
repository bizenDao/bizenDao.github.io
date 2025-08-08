#!/usr/bin/env sh

# abort on errors
set -e

# build
echo Building...
npm run build

# navigate into the build output directory
cd dist

# create a new git repository
git init
git add -A
git commit -m 'Deploy to GitHub Pages'

# push to gh-pages branch
git push -f git:bizenDao/bizenDao.github.io.git master:gh-pages

cd -

echo Deployed to GitHub Pages!