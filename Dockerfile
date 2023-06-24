FROM node:lts as dev

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json", "tsconfig.json", "/usr/src/app/"]
RUN npm ci
COPY [".", "/usr/src/app/"]
RUN npm run build

FROM node:lts as build-prod

WORKDIR /usr/src/app

COPY --from=dev /usr/src/app/package.json ./package.json
COPY --from=dev /usr/src/app/package-lock.json ./package-lock.json

RUN npm ci --production

FROM node:lts-slim as prod

WORKDIR /usr/src/app

COPY --from=build-prod /usr/src/app/package.json ./package.json
COPY --from=build-prod /usr/src/app/package-lock.json ./package-lock.json
COPY --from=build-prod /usr/src/app/node_modules ./node_modules

COPY --from=dev /usr/src/app/config ./config
COPY --from=dev /usr/src/app/dist ./dist

EXPOSE 4000

CMD [ "node", "/usr/src/app/dist/server.js"]