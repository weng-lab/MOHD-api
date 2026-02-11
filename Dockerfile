# Install stage
# official bun image
FROM oven/bun:1 AS build
WORKDIR /usr/src/app

COPY . .
RUN bun install
RUN bun run build

# release stage
FROM oven/bun:1 AS release
COPY --from=build /usr/src/app/dist/index.js ./index.js

# run the api
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "index.js" ]
