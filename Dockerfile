# 1. 빌드 환경
FROM node:18-alpine AS builder
WORKDIR /app

# 종속성 설치
COPY package*.json ./
RUN npm install

# 소스 복사 및 빌드
COPY . .
RUN npm run build

# 2. 실제 서비스 환경
FROM node:18-alpine
WORKDIR /app

# 정적 파일 복사
COPY --from=builder /app/dist ./dist

# serve 설치 및 포트 노출
RUN npm install -g serve
EXPOSE 9000

# 앱 실행
CMD ["serve", "-s", "dist", "-l", "9000"]