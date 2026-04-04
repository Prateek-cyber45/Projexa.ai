FROM node:20-alpine

WORKDIR /app

# Install dependencies fast
COPY package.json ./
RUN npm install

# Copy server and static files
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
