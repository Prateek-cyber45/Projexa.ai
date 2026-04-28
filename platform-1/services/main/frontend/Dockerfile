# Standard Next.js Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the website files
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port (Docker Compose maps this)
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "start"]