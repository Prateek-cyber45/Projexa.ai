# Minimal Next.js build Dockerfile
FROM node:20-alpine

WORKDIR /app

# copy package manifest (if exists) and install
COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
