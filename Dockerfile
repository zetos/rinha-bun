# use the official Bun image
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# install dependencies into temp directory
FROM base AS install
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY src/index.ts .
COPY src/db.ts .
COPY package.json .

# run the app
ENV NODE_ENV=production
USER bun

ENV NODE_ENV=production

ENTRYPOINT [ "bun", "run", "src/index.ts" ]
