FROM node:10

WORKDIR /home/apps/inventory_management
COPY package*.json ./
# Install Dependencies
RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3010

CMD ["npm", "start"]
