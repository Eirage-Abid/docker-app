# --- Base image of our custom project---
FROM node:20-alpine

# --- Set working directory inside the container ---
WORKDIR /app

# --- Install dependencies first (cached layer, only rebuilds if these files change) ---
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# --- Copy the rest of the app source ---
COPY src ./src

# --- App runs on this port ---
EXPOSE 3000

# --- Start the app ---
CMD ["node", "src/server.js"]
