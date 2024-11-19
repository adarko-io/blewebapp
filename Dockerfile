FROM node:22-bullseye

WORKDIR /app

# Copy package.json and lock file first to leverage Docker's layer caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Add the missing plugin to dependencies
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 3066

# Command to serve the build
CMD ["serve", "-s", "build", "-l", "3066"]