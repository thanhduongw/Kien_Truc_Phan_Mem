# KTTKPM Lab10 - Food Ordering Microservices

## Thong tin
- Tac gia: Le Vu Thanh Duong
- Kien truc: Microservices (User, Food, Order, Payment, Frontend)
- Database: MariaDB

## Trang thai CircuitBreaker + Retry + RateLimiter
Da co trong `order-service/index.js`:
- `RateLimiter`: `express-rate-limit`, gioi han `30 requests / 60s` tren route `/api/orders`.
- `Retry`: Cockatiel `retry(...)`, `maxAttempts = 3`, exponential backoff `200ms -> 2000ms`.
- `CircuitBreaker`: Cockatiel `circuitBreaker(...)`, mo mach sau `3` loi lien tiep, thu `half-open` sau `15s`.

## Yeu cau moi truong
- Docker + Docker Compose
- Hoac Node.js 18+ neu chay local

## Cach chay nhanh bang Docker Compose (khuyen nghi)
Tai thu muc goc du an:

```bash
docker compose up --build
```

Sau khi chay:
- Frontend: http://localhost:3000
- User Service: http://localhost:3001/api/users
- Food Service: http://localhost:3002/api/foods
- Order Service: http://localhost:3003/api/orders
- Payment Service: http://localhost:3004/api/payments

Dung he thong:

```bash
docker compose down
```

## Cach chay local tung service (khong dung Docker)
Luu y: can co MariaDB dang chay o `localhost:3306` voi mat khau root la `sapassword` (hoac sua bien moi truong cho phu hop).

1. Cai dependencies cho tung service:
```bash
cd user-service && npm install
cd ../food-service && npm install
cd ../order-service && npm install
cd ../payment-service && npm install
cd ../frontend && npm install
```

2. Mo 5 terminal backend + 1 terminal frontend, chay:
```bash
# terminal 1
cd user-service && npm run dev

# terminal 2
cd food-service && npm run dev

# terminal 3
cd order-service && npm run dev

# terminal 4
cd payment-service && npm run dev

# terminal 5
cd frontend && npm run dev
```

3. Truy cap frontend local (Vite):
- Thuong la: http://localhost:5173

## Bien moi truong chinh
- `DB_HOST` (mac dinh: `localhost`)
- `DB_PORT` (mac dinh: `3306`)
- `DB_USER` (mac dinh: `root`)
- `DB_PASSWORD` (mac dinh: `sapassword`)
- `PORT` (port cua moi service)
- `USER_SERVICE_URL` (order-service -> user-service)
- `FOOD_SERVICE_URL` (order-service -> food-service)
- `ORDER_SERVICE_URL` (payment-service -> order-service)

