#!/usr/bin/env bash

set -e
set -o pipefail

user="jw"
host="huisartspoelstra.nl"

echo "----------"
echo "Local: Deploying..."
echo "----------"
(set -x; git checkout production -f)
(set -x; git pull origin master)
(set -x; git push)
echo "----------"
(set -x; ssh $user@$host "/var/www/$host/; remote/install.sh")
echo "----------"
(set -x; git checkout master)
echo "----------"
echo "Local: Done!"
echo "----------"
