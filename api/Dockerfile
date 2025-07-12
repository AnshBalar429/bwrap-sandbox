FROM node:22-alpine3.21

WORKDIR /home/app

COPY package*.json ./

RUN npm install
RUN npm install typescript

COPY . .

EXPOSE 3000

CMD [ "npm", "run", "start" ]