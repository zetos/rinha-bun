FROM oven/bun:slim

WORKDIR /usr/src/app

COPY package.json ./
COPY bun.lockb ./
COPY .bunfig.toml ./

RUN bun install --frozen-lockfile --production

COPY . .

ENV NODE_ENV=production

ENTRYPOINT [ "bun", "run", "src/index.ts" ]