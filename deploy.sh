#!/usr/bin/env bash

set -e
set -o pipefail

BRANCH=$(git rev-parse --abbrev-ref HEAD)
REVISION=$(git rev-parse --short HEAD)
PROJECT=$(basename $(git remote get-url origin) | rev | cut -c5- | rev)

echo "----------"
echo "Deploying:"
echo $BRANCH
echo $REVISION
echo $PROJECT
echo "----------"
echo "scp install.sh deploy@$PROJECT:/var/www/$PROJECT"
scp install.sh deploy@$PROJECT:/var/www/$PROJECT
echo "----------"
echo 'ssh deploy@$PROJECT "/var/www/$PROJECT/install.sh $branch $revision $PROJECT"'
ssh deploy@$PROJECT "/var/www/$PROJECT/install.sh $branch $revision $PROJECT"
