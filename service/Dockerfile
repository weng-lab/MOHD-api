# Install stage
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install into temp to cache
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json /temp/dev/
RUN cd /temp/dev && bun install

# build stage
FROM base AS build
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
RUN bun run build

# release stage
FROM oven/bun:1 AS release
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/. .

COPY --from=build /usr/src/app/dist/index.js .
#COPY --from=build /usr/src/app/* .

# run the api
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "index.js" ]
