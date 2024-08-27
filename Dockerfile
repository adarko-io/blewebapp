FROM node:alpine

# Create the application directory
RUN mkdir /app

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json file and install dependencies
COPY package.json /app
RUN npm install

# Install serve globally
RUN npm install -g serve

# Copy the entire application to the container
COPY . /app

RUN npm run build

# Command to run the application using serve
CMD ["serve", "-s", "build", "-l", "3006"]