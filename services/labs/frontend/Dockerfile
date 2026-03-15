# Standard Next.js Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
# install with legacy-peer-deps to avoid xterm peer dependency conflicts
RUN npm install --legacy-peer-deps

# Copy the rest of the website files
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port (Docker Compose maps this)
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "start"]