#!/usr/bin/env bash

set -e
set -o pipefail

branch=$(git rev-parse --abbrev-ref HEAD)
revision=$(git rev-parse --short HEAD)

echo "----------"
echo "Deploying:"
echo $branch
echo $revision
echo "----------"
echo "scp install.sh deploy@huisartspoelstra.nl:/var/www/huisartspoelstra.nl"
scp install.sh deploy@poncho.floatplane.dev:/var/www/huisartspoelstra.nl
echo "----------"
echo 'ssh deploy@huisartspoelstra.nl "/var/www/huisartspoelstra.nl/install.sh $branch $revision"'
ssh deploy@poncho.floatplane.dev "/var/www/huisartspoelstra.nl/install.sh $branch $revision"
