FROM node:12-alpine

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./
RUN npm install --silent

COPY . .

EXPOSE 80

CMD [ "npm", "start" ]