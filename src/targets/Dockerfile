FROM node:8
WORKDIR /app
ADD package.json yarn.lock /app/
RUN yarn install
ADD . /app
