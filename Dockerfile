FROM node:10.13.0
RUN apt-get update && apt-get -y install cron
WORKDIR /app
COPY package.json package-lock.json /app/
COPY src /app/src
COPY tsconfig.json /app/

# Crontab set up
COPY crontab /etc/cron.d/sf-events-cron
RUN chmod 0644 /etc/cron.d/sf-events-cron
RUN touch /var/log/cron.log

RUN npm install
RUN npm run build

CMD cron && tail -f /var/log/cron.log
