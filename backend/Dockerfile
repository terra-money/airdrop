FROM node:14.17-alpine

# Create app directory
WORKDIR /app

COPY package*.json ./

# node-gyp dependencies
RUN apk add --update python make g++ && rm -rf /var/cache/apk/*

# Install dependencies from package-lock.json
RUN npm ci --no-audit --no-fund

COPY . .

RUN npm run build

# Remove the packages specified in devDependencie
RUN npm prune --production

# probably better handled in code, but make csv dir
RUN mkdir -p .files

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin
ENV APP_PORT=3000

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]
