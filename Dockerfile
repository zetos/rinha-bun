FROM oven/bun:latest

WORKDIR /usr/src/app

COPY package.json ./
COPY bun.lockb ./
# COPY src ./

RUN bun install --frozen-lockfile --production

COPY . .

ENV NODE_ENV=production

ENTRYPOINT [ "bun", "run", "src/index.ts" ]