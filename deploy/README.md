# Despliegue en Azure VM (PetsRadar)

Guia basada en [612-IncidentAPI-Infrastructure](https://github.com/JFRClasses/612-IncidentAPI-Infrastructure) y `terraform/ansible.txt`.

## Opcion A: stack unificado

Un solo `docker compose` con postgres, redis y API:

```bash
cp deploy/.env.example deploy/.env
docker compose -f deploy/compose.prod.yaml up -d
```

## Opcion B: contenedores separados (como ansible.txt)

### 1. Red Docker

```bash
docker network create petradar-network
```

### 2. Estructura en el servidor

```bash
mkdir -p /containers/postgres
mkdir -p /containers/redis
mkdir -p /containers/petradar-api
mkdir -p /containers/wireguard
```

Copia cada carpeta de `deploy/containers/<servicio>/` a `/containers/<servicio>/`.

### 3. Login en GHCR

```bash
docker login ghcr.io -u <github-username> -p <github-personal-access-token>
```

### 4. Variables de entorno

```bash
cp deploy/containers/postgres/.env.example /containers/postgres/.env
cp deploy/containers/petradar-api/.env.example /containers/petradar-api/.env
```

### 5. Levantar servicios

```bash
cd /containers/postgres && docker compose up -d
cd /containers/redis && docker compose up -d
cd /containers/petradar-api && docker compose up -d
```

### 6. Verificar

```bash
curl http://localhost:3000/api/lost-pets
```

Desde fuera de la VM:

```bash
curl http://<PUBLIC_IP>:3000/api/lost-pets
```

## Actualizar la imagen de la API

```bash
cd /containers/petradar-api
docker compose pull
docker compose up -d
```
