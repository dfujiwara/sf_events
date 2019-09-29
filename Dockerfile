FROM node:10.13.0
RUN apt-get update && apt-get -y install cron
WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm install

COPY src /app/src
COPY tsconfig.json /app/
RUN npm run build
