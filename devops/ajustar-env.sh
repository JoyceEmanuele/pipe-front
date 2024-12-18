#!/bin/bash

DIEL_ENV=${1:-none}

if [ $DIEL_ENV = "prod" ]; then
  REACT_APP_API_URL="https://api.dielenergia.com:9443"
  REACT_APP_WEBSOCKET_URL="wss://api.dielenergia.com:9443/wsfront"
  BUCKET_GCP="dash-frontend-bucket"
  LOAD_BALANCER_NAME="dap-amb-iot-dielenergia-com"
  GCP_PROJECT="prod-default-1"
  REACT_APP_APM_ELASTIC=https://apm.dielenergia.com
  REACT_APP_APM_TOKEN=apmagentdash
  REACT_APP_GA_ID=UA-239153510-2
  REACT_APP_POSTHOG_KEY=phc_oWqqrhSM64UNZ511aFeBQ5CHgVEU7U2vsWf2mDuGBgl
  REACT_APP_POSTHOG_HOST=https://app.posthog.com
fi

if [ $DIEL_ENV = "qa" ]; then
  REACT_APP_API_URL="https://api-qa.dielenergia.com"
  REACT_APP_WEBSOCKET_URL="wss://api-qa.dielenergia.com:8010/wsfront"
  BUCKET_S3="diel-dash-front-qa"
  DISTRIBUTION_ID="E1CLJNE5Q3YI5S"
  REACT_APP_APM_ELASTIC=https://elastic-qa.dielenergia.com:8201
  REACT_APP_APM_TOKEN=apmagentdash
fi

if [ $DIEL_ENV = "nave" ]; then
  REACT_APP_API_URL="https://api-dev-nav.dielenergia.com"
  REACT_APP_WEBSOCKET_URL="wss://api-dev-nav.dielenergia.com:8010/wsfront"
  BUCKET_S3="diel-dash-front-dev-nave"
  DISTRIBUTION_ID="ETTLT19J74T6X"
fi

if [ $DIEL_ENV = "demo" ]; then
  REACT_APP_API_URL="https://api-demo.dielenergia.com"
  REACT_APP_WEBSOCKET_URL="wss://api-demo.dielenergia.com:8010/wsfront"
  BUCKET_S3="celsius360-demo-v2"
  DISTRIBUTION_ID="E2GJKIVECFN3FN"
fi

if [ $DIEL_ENV = "local" ]; then
  REACT_APP_API_URL="http://localhost:8082"
  REACT_APP_WEBSOCKET_URL="ws://localhost:46132/wsfront"
fi

# Cria o arquivo .env se não existir
if [ ! -e ./.env ]; then
  touch ./.env
fi
if ! grep -q REACT_APP_API_URL ./.env; then
  echo "REACT_APP_API_URL=http://localhost:8082" >> ./.env
fi
if ! grep -q REACT_APP_WEBSOCKET_URL ./.env; then
  echo "REACT_APP_WEBSOCKET_URL=ws://localhost:46132" >> ./.env
fi
if ! grep -q REACT_APP_GA_ID ./.env; then
  echo "#REACT_APP_GA_ID=" >> ./.env
fi
if ! grep -q REACT_APP_APM_ELASTIC ./.env; then
  echo "#REACT_APP_APM_ELASTIC=" >> ./.env
fi
if ! grep -q REACT_APP_APM_TOKEN ./.env; then
  echo "#REACT_APP_APM_TOKEN=" >> ./.env
fi

# Ajusta o arquivo .env
if [ -v REACT_APP_API_URL ]; then
  sed -i '/^REACT_APP_API_URL=/c\REACT_APP_API_URL='$REACT_APP_API_URL ./.env
  sed -i '/^REACT_APP_WEBSOCKET_URL=/c\REACT_APP_WEBSOCKET_URL='$REACT_APP_WEBSOCKET_URL ./.env
fi

if [[ $1 = "--send-to-aws" || $2 = "--send-to-aws" || $3 = "--send-to-aws" || $4 = "--send-to-aws" || $5 = "--send-to-aws" ]]; then
  if [[ ( ! -v BUCKET_S3 ) && ( ! -v BUCKET_GCP ) ]]; then
    echo "Nenhum ambiente selecionado, escolha entre prod, qa ou nave"
    exit 1
  fi;
  sed -i '/^#\{0,1\}REACT_APP_GA_ID=/c\REACT_APP_GA_ID='$REACT_APP_GA_ID ./.env
  sed -i '/^#\{0,1\}REACT_APP_APM_ELASTIC=/c\REACT_APP_APM_ELASTIC='$REACT_APP_APM_ELASTIC ./.env
  sed -i '/^#\{0,1\}REACT_APP_APM_TOKEN=/c\REACT_APP_APM_TOKEN='$REACT_APP_APM_TOKEN ./.env
else
  sed -i '/^REACT_APP_GA_ID=/c\#REACT_APP_GA_ID=' ./.env
  sed -i '/^REACT_APP_APM_ELASTIC=/c\#REACT_APP_APM_ELASTIC=' ./.env
  sed -i '/^REACT_APP_APM_TOKEN=/c\#REACT_APP_APM_TOKEN=' ./.env
fi
