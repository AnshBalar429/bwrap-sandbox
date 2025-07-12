FROM node:22-alpine3.21

RUN apk add --no-cache bubblewrap python3

WORKDIR /home/app

COPY package*.json ./

RUN npm install
RUN npm install typescript

COPY . .


CMD [ "npm", "run", "start" ]