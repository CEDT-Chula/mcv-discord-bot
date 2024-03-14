# Use a specific node version for predictability
FROM node:20-slim
# add dependencies
RUN apt-get update && apt-get install -y openssl

# Set working directory
WORKDIR /home/node/app

COPY . .

# Install dependencies
RUN npm ci

RUN npm run build

# Start the app, do migrations first
CMD ["npm", "start"]
HEALTHCHECK CMD curl --fail http://localhost:3000/health || exit 1