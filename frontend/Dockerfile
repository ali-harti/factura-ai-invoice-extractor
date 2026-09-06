FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run Vite development server, binding to all interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
