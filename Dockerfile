FROM node:20-alpine

WORKDIR /api

COPY package*.json ./

RUN npm install -g npm@10.4.0

EXPOSE ${API_PORT}

COPY . .

CMD ["npm", "start"]