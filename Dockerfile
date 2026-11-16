FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY frontend ./frontend
RUN npm run typecheck && npm run build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production \
    PORT=8080 \
    NODE_EXTRA_CA_CERTS=/etc/ssl/certs/aws-rds-global-bundle.pem
WORKDIR /app

RUN wget -q https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem \
      -O /etc/ssl/certs/aws-rds-global-bundle.pem \
    && echo "90a6f1a7978a1b1b096dca6c57511ca48d3b8cf052f8e704baf358f34ea2f21b  /etc/ssl/certs/aws-rds-global-bundle.pem" | sha256sum -c -

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY backend ./backend
COPY database ./database
COPY --from=build /app/frontend/dist ./frontend/dist

RUN mkdir -p /app/uploads \
    && chown -R node:node /app

USER node
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8080/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "backend/server.js"]
