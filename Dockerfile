FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

# Run sync script to create tables, then start the server
CMD ["sh", "-c", "npx ts-node src/sync.ts && node dist/index.js"]
