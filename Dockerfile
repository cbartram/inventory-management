# Format for ARM CPU's instead of intel's x86/64
FROM arm32v7/node:latest

WORKDIR /var/www/html

COPY package*.json ./

# Install Dependencies
RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3010

CMD ["node", "index.js"]
