FROM node:20.13.1

WORKDIR /app

# install desired version of yarn
RUN corepack enable && corepack prepare yarn@4.2.2 --activate

COPY package.json \
	yarn.lock \
	.yarnrc.yml \
	./
COPY .yarn /app/.yarn
RUN cd /app && yarn install
