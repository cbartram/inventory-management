#!/bin/sh
GREEN='\033[0;32m'
NC='\033[0m' # No Color

PACKAGE_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')

echo "${GREEN}[INFO] Starting Docker  Build -- Inventory-Management${NC}"
echo "${GREEN}[INFO] Version: ${PACKAGE_VERSION} ${NC}"
docker build \
 -t cbartram/inventory_management:"$PACKAGE_VERSION"\
 .

echo "${GREEN}[INFO] Pushing to Docker Hub${NC}"
docker push cbartram/inventory_management:"$PACKAGE_VERSION"
echo "${GREEN}[INFO] Cleaning up...${NC}"
docker system prune -a
echo "${GREEN}[INFO] Done!${NC}"
