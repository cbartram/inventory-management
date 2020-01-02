# Format for ARM CPU's instead of intel's x86/64
FROM arm32v7/node:latest

WORKDIR /var/www/html

COPY package*.json ./

# Ensures the post install gets triggered correctly with root priv
RUN npm set unsafe-perm true

# Install Dependencies
# a "postinstall" step from npm will also cd into the /client dir
# perform an NPM install and also a react build
RUN npm install

# Bundle app source
COPY . .

EXPOSE 3010

CMD ["node", "index.js"]
