FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

RUN adduser -D appuser

COPY . .
RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=10s \
    CMD node -e "require('http').get('http://localhost:4000/api/labs/health', r => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
