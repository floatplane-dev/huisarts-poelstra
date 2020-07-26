#!/usr/bin/env bash

set -e
set -o pipefail

# This hack makes the nvm binary available to this script.
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

echo "----------"
echo "Remote: installing..."
echo "----------"
(set -x; cd ..)
echo "----------"
(set -x; git pull)
echo "----------"
(set -x; nvm install)
echo "----------"
(set -x; yarn install)
echo "----------"
(set -x; yarn build)
echo "----------"
echo "Remote: installation done"
echo "----------"
