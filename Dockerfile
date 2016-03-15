FROM node

COPY index.html /app/index.html
COPY dist/*.js /app/dist/
COPY server/*.js /app/server/

COPY package.json /app/package.json
RUN cd /app; npm install --production

COPY data/* /app/data/
VOLUME /app/data

ENV NODE_ENV production
EXPOSE 80

WORKDIR /app
CMD ["node", "server/index.js"]
