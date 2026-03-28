# Sử dụng image postgres 15
FROM postgres:15

# Copy file SQL vào thư mục init của PostgreSQL
COPY init.sql /docker-entrypoint-initdb.d/

# Thiết lập biến môi trường cơ bản
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=mydb

# Expose port PostgreSQL
EXPOSE 5432