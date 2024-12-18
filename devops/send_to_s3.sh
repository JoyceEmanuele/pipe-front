#!/bin/bash

#export AWS_ACCESS_KEY_ID="abcxyz"
#export AWS_SECRET_ACCESS_KEY="abcxyz"
#export AWS_SESSION_TOKEN="abcxyz"

# Este tratamento é opcional, pode ignorar este if
if [ -e "$HOME/diel-env.sh" ]; then
  source "$HOME/diel-env.sh" $1
fi

if [ -z "$AWS_ACCESS_KEY_ID" ]; then
  echo "As credenciais do AWS não foram informadas"
  exit 1
fi

source ./devops/compile.sh "$@" --send-to-aws || exit 1

if [ -n "$BUCKET_S3" ]; then
  aws s3 sync build s3://$BUCKET_S3 || exit 1
  aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths /index.html
fi

if [ -n "$BUCKET_GCP" ]; then
  gcloud storage cp --recursive build/* gs://$BUCKET_GCP
  gcloud compute url-maps invalidate-cdn-cache $LOAD_BALANCER_NAME --project $GCP_PROJECT --path "/index.html"
fi
