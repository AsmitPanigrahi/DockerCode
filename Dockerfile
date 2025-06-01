# official Node.js image as the base image
FROM node:20-alpine

# Alpine packages to reduce vulnerabilities
RUN apk update && apk upgrade

# Creating app directory
WORKDIR /usr/src/app

# Copying package.json and package-lock.json
COPY package*.json ./


# Installing app dependencies
RUN npm install

# Copying app source
COPY . .

# Exposing the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "app.js"]
