FROM node:14

WORKDIR /usr/src/app
COPY . /usr/src/app

RUN npm install --prefix angular
RUN npm run prod --prefix angular
RUN npm install

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE $PORT

ENTRYPOINT ["npm", "run", "start"]
