FROM ghcr.io/puppeteer/puppeteer:latest

# Set correct working directory
WORKDIR /src/app

COPY AI/package*.json ./
RUN rm -f package-lock.json && npm install
RUN npm install

COPY AI ./AI
WORKDIR /src/app/AI/src

ENV NODE_OPTIONS=--max-old-space-size=2048

CMD ["npx", "ts-node", "index.ts"]
