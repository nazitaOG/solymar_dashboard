<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Solymar Dashboard – Backend (NestJS + Prisma + PostgreSQL + Docker)

API de reservas (Pax, Passport/DNI, Reservations, etc.) construida con **NestJS**, **Prisma** y **PostgreSQL**.  
Se provee **Dockerfile** + **docker-compose** para levantar todo con un solo comando.

## Requisitos

- **Docker**
- **Node.js 22+** (solo si vas a correr fuera de Docker)  
- **pnpm** (opcional para desarrollo local)

---

## Primeros pasos

```bash
# 1) Clonar
git clone <https://github.com/nazitaOG/solymar_dashboard.git>
cd solymar_dashboard

# 2) Crear archivo de entorno
cp .env.example .env

# 3) Levantar DB + API con Docker
docker compose up -d --build

# 4) Ver logs de la app
docker compose logs -f app

# 5) Probar en el navegador / client HTTP
http://localhost:3000
