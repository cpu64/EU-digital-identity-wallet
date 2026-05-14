#!/bin/bash

REGION="us-central1"
REPO="wallet-repo"
PROJECT_ID=""

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --project) PROJECT_ID="$2"; shift ;;
        --region) REGION="$2"; shift ;;
        --repo) REPO="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

if [ -z "$PROJECT_ID" ]; then
    echo "Error: --project is required."
    echo "Usage: ./build_and_push.sh --project YOUR_PROJECT_ID [--region us-central1] [--repo wallet-repo]"
    exit 1
fi

REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}"

SERVICES=("pid-provider" "relying-party" "reverse-proxy" "trusted-list" "wallet-backend" "wallet-frontend" "certificate-authority" "pid-db")

echo "========================================"
echo "Authenticating Docker with Artifact Registry..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

for SERVICE in "${SERVICES[@]}"; do
    echo "========================================"
    echo "Building and pushing $SERVICE..."

    IMAGE_TAG="${REGISTRY}/${SERVICE}:latest"

    docker build -t "$IMAGE_TAG" "./src/${SERVICE}"
    docker push "$IMAGE_TAG"
done

echo "========================================"
echo "Done pushing images!"
echo "Updating cloud-run-service.yaml with a new timestamp to force a Cloud Run revision..."
NEW_VERSION="deploy-$(date +%s)"
sed -i "s|run.googleapis.com/client-name: .*|run.googleapis.com/client-name: \"$NEW_VERSION\"|" cloud-run-service.yaml
sed -i "s|value: \"deploy-.*\"|value: \"$NEW_VERSION\"|" cloud-run-service.yaml
echo "Annotation and DEPLOY_ID updated to: $NEW_VERSION"

echo "Now deploy your updated service:"
echo "gcloud run services replace cloud-run-service.yaml --region $REGION"
