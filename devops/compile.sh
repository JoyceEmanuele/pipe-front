#!/bin/bash

source ./devops/ajustar-env.sh "$@" || exit 1

source .env
echo "API = $REACT_APP_API_URL"

#yarn
NODE_OPTIONS='--openssl-legacy-provider --max-old-space-size=6144'
npm run build || exit 1
