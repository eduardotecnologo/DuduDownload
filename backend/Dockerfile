FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY tsconfig.base.json ./tsconfig.base.json
COPY backend/package.json backend/tsconfig.json backend/vitest.config.ts backend/eslint.config.js backend/.env.example ./backend/
RUN cd backend && npm install
COPY backend/src ./backend/src
RUN cd backend && npm run build

FROM node:22-bookworm-slim
WORKDIR /app/backend
COPY --from=deps /app/backend/node_modules ./node_modules
COPY --from=deps /app/backend/dist ./dist
COPY backend/package.json ./package.json
COPY backend/.env.example ./
EXPOSE 4000
CMD ["npm", "run", "start"]
