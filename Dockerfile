# Install dependencies only when needed
FROM node:22-alpine AS deps
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the app
FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept build arguments for environment variables
ARG VITE_GA_MEASUREMENT_ID
ENV VITE_GA_MEASUREMENT_ID=${VITE_GA_MEASUREMENT_ID}

# Build the application
RUN pnpm run build

# Production image - use nginx to serve static files
FROM nginx:alpine AS runner

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Remove default site
RUN rm /etc/nginx/conf.d/default.conf

# http-level gzip config (included by nginx.conf -> http { include conf.d/*.conf; })
# NOTE: No 'server { }' here — these must be in http context
RUN printf '%s\n' \
  'gzip on;' \
  'gzip_vary on;' \
  'gzip_min_length 1024;' \
  'gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/rss+xml;' \
  > /etc/nginx/conf.d/gzip.conf

# Server block listening on 8080 with SPA routing and SEO optimizations
RUN printf '%s\n' \
  'server {' \
  '    listen 8080;' \
  '    server_name _;' \
  '    root /usr/share/nginx/html;' \
  '    index index.html;' \
  '' \
  '    # Cache static assets for 1 year' \
  '    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {' \
  '        expires 1y;' \
  '        add_header Cache-Control "public, immutable";' \
  '    }' \
  '' \
  '    # SEO files - short cache for freshness' \
  '    location = /robots.txt {' \
  '        add_header Content-Type text/plain;' \
  '        expires 1d;' \
  '    }' \
  '' \
  '    location = /sitemap.xml {' \
  '        add_header Content-Type application/xml;' \
  '        expires 1d;' \
  '    }' \
  '' \
  '    # Prerendered visualizer page' \
  '    location = /visualizer {' \
  '        try_files /visualizer/index.html /index.html;' \
  '    }' \
  '' \
  '    # SPA fallback' \
  '    location / {' \
  '        try_files $uri $uri/ /index.html;' \
  '    }' \
  '}' > /etc/nginx/conf.d/site.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
