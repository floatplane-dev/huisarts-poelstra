#!/usr/bin/env bash

set -e
set -o pipefail

host="huisartspoelstra.nl"
user="jw"

branch=$(git rev-parse --abbrev-ref HEAD)
revision=$(git rev-parse --short HEAD)

echo "----------"
echo "Deploying:"
echo $branch
echo $revision
echo "----------"

(set -x; scp install.sh $user@$host:/var/www/$host)

echo "----------"

(set -x; ssh $user@$host "/var/www/$host/install.sh $branch $revision")
