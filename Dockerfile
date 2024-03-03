FROM node:20-alpine
WORKDIR /home/node/app
USER root
COPY --chown=root:node package*.json ./
RUN npm install -g typescript
RUN npm install
COPY --chown=root:node . .
RUN npx prisma generate
RUN tsc
CMD ["node","./build/src/index.js"]