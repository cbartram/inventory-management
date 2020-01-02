#!/bin/bash

# This File Runs Coding style (eslint) tests to ensure there are no errors in the new code.
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color


echo "${GREEN}========================${NC}"
echo "${GREEN}|Starting Deployment...|${NC}"
echo "${GREEN}========================${NC}"

PACKAGE_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')

# TODO future improvement make sure docker API does not already have an imaged tagged with this package version. If so throw an error or bump the version then try again?
#UNAME=""
#UPASS=""
#
## -------
#
#set -e
#echo
#
## aquire token
#TOKEN=$(curl -s -H "Content-Type: application/json" -X POST -d '{"username": "'${UNAME}'", "password": "'${UPASS}'"}' https://hub.docker.com/v2/users/login/ | jq -r .token)
#
## get list of repositories for the user account
#REPO_LIST=$(curl -s -H "Authorization: JWT ${TOKEN}" https://hub.docker.com/v2/repositories/${UNAME}/?page_size=100 | jq -r '.results|.[]|.name')
#
## build a list of all images & tags
#for i in ${REPO_LIST}
#do
#  # get tags for repo
#  IMAGE_TAGS=$(curl -s -H "Authorization: JWT ${TOKEN}" https://hub.docker.com/v2/repositories/${UNAME}/${i}/tags/?page_size=100 | jq -r '.results|.[]|.name')
#
#  # build a list of images from tags
#  for j in ${IMAGE_TAGS}
#  do
#    # add each tag to list
#    FULL_IMAGE_LIST="${FULL_IMAGE_LIST} ${UNAME}/${i}:${j}"
#  done
#done
#
## output
#for i in ${FULL_IMAGE_LIST}
#do
#  echo ${i}
#done

echo "${GREEN}Logging into docker account for user: ${DOCKER_USERNAME} ${NC}"
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

echo "${GREEN}Building docker image for application version: ${PACKAGE_VERSION} ${NC}"
docker build -t cbartram/inventory_management:$PACKAGE_VERSION .

echo "${GREEN}Tagging git version: ${PACKAGE_VERSION} ${NC}"
git tag $PACKAGE_VERSION && git push --tags

echo "${GREEN}Pushing Docker Image version: ${PACKAGE_VERSION} to Docker Hub..."
docker push cbartram/inventory_management:$PACKAGE_VERSION