# Use Node Alpine
FROM node:20-alpine

FROM ghcr.io/puppeteer/puppeteer:latest

# Set working directory
WORKDIR /app

# Copy package files from AI folder
COPY AI/package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY AI ./

# Move into src
WORKDIR /app/src

# Start server
CMD ["npx", "ts-node", "index.ts", "--port", "3000", "--host", "0.0.0.0"]
