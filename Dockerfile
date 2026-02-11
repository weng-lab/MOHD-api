# Install stage
# official bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install into temp to cache
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# build stage
FROM base AS build
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
RUN bun run build

# release stage
FROM oven/bun:1 AS release
COPY --from=build /usr/src/app/dist/index.js .

# run the api
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "index.js" ]
