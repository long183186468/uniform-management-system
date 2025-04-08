FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

# 创建上传目录
RUN mkdir -p public/uploads/images

# 设置权限
RUN chmod -R 755 public/uploads

EXPOSE 3000

CMD ["node", "src/server.js"] 