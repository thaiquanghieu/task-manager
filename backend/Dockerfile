FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["sh", "-c", "npx typeorm migration:run -d dist/database/data-source.js && node dist/database/seed.js && node dist/main.js"]