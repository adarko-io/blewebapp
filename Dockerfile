FROM node:alpine
RUN mkdir /app
WORKDIR /app
COPY package.json /app
RUN npm install
RUN npm install -g serve
COPY . /app
CMD ["serve -s", "build -l 3006"]