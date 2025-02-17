FROM node:alpine

COPY src /app

WORKDIR /app

RUN npm install 

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]