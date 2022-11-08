FROM node:latest
COPY . /src
WORKDIR /src
RUN ls
RUN npm install
CMD [ "npm", "run", "dev" ]
EXPOSE 3000