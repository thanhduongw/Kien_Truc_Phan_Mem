# Travel Booking System - Orchestration-Driven SOA

## Thanh vien nhom
- Le Vu Thanh Duong
- Nguyen Van Huy
- Mai Duc Truong

## Huong dan bat dau nhanh (Quick Start)

1. Chuan bi moi truong
Dam bao may tinh da cai:
- Docker va Docker Compose.
- Node.js (de chay frontend).

2. Cau hinh bien moi truong
Neu chay local, khong can sua gi.
Neu chay tren LAN (phan tan), can dat IP dung yeu cau:
- Orchestrator: 192.168.1.10:8080
- User: 192.168.1.11:8081
- Tour: 192.168.1.12:8082
- Booking: 192.168.1.13:8083
- Payment: 192.168.1.14:8084
- Frontend: 192.168.1.15:3000

Dat bien moi truong cho Orchestrator:
- USER_SERVICE_URL=http://192.168.1.11:8081
- TOUR_SERVICE_URL=http://192.168.1.12:8082
- BOOKING_SERVICE_URL=http://192.168.1.13:8083
- PAYMENT_SERVICE_URL=http://192.168.1.14:8084

Dat bien moi truong cho Frontend (file frontend/.env):
```
VITE_ORCHESTRATOR_URL=http://192.168.1.10:8080
```

3. Khoi chay backend (Docker)
Chay lenh sau tai thu muc goc:
```
docker-compose up --build -d
```

4. Kiem tra trang thai
Xem log de chac chan cac service da san sang:
```
docker-compose logs -f
```

5. Khoi chay frontend
```
cd frontend
npm install
npm run dev
```

6. Truy cap
- Frontend: http://localhost:3000
