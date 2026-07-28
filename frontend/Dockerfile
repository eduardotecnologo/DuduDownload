FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY tsconfig.base.json ./tsconfig.base.json
COPY frontend/package.json frontend/tsconfig.json frontend/tsconfig.node.json frontend/vite.config.ts frontend/tailwind.config.ts frontend/postcss.config.cjs frontend/eslint.config.js frontend/vitest.config.ts ./frontend/
RUN cd frontend && npm install
COPY frontend/index.html frontend/src ./frontend/
RUN cd frontend && npm run build

FROM nginx:1.27-alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
