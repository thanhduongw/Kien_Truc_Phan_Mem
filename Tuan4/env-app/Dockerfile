# ======================
# Stage 1: Build
# ======================
FROM node:18 AS build

# Tạo thư mục làm việc
WORKDIR /app

# Copy file package.json và package-lock.json trước (cache tốt hơn)
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Chạy build script (nếu cần)
RUN npm run build

# ======================
# Stage 2: Run
# ======================
FROM node:18-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy chỉ node_modules và code đã build từ stage trước
COPY --from=build /app /app

# Expose port (nếu app Node chạy server)
EXPOSE 3000

# Chạy ứng dụng
CMD ["npm", "start"]