FROM node:12
WORKDIR /opt/app/
ENV YARN_VERSION 1.22.5

RUN curl -fSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
    && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/ \
    && ln -snf /opt/yarn-v$YARN_VERSION/bin/yarn /usr/local/bin/yarn \
    && ln -snf /opt/yarn-v$YARN_VERSION/bin/yarnpkg /usr/local/bin/yarnpkg \
    && rm yarn-v$YARN_VERSION.tar.gz
COPY package*.json ./
COPY package.json yarn.lock ./
COPY . .
RUN yarn install
RUN yarn add fullcalendar
RUN yarn add node-cron
EXPOSE 3000
EXPOSE 4001
CMD yarn start