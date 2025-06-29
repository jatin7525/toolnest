# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR ./src/app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build if needed (skip if running TS via ts-node)
RUN npm run build

# Expose the port your server listens on
EXPOSE 5000

# Start the server
CMD [ "node", "dist/index.js" ]
