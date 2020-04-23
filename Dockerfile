FROM node:12-alpine

RUN apk --no-cache add --virtual builds-deps build-base python

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./
RUN npm set progress=false && npm config set depth 0
RUN npm install --only=production --silent
RUN npm install -g knex

COPY . .

EXPOSE 8080 8081

CMD [ "npm", "start" ]