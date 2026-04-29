FROM node:20-alpine

WORKDIR /usr/src/app

COPY app/package*.json ./
RUN npm install --omit=dev

COPY app/server.js ./server.js
COPY public ./public

EXPOSE 3000

CMD ["node", "server.js"]
