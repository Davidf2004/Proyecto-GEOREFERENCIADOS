# DFonsecaPetsRadar

API REST en NestJS para registrar mascotas perdidas y encontradas sobre PostgreSQL + PostGIS, con notificaciones por correo, cache con Redis, telemetria en Azure Application Insights, contenerizacion con Docker y publicacion de imagen en GitHub Container Registry.

Todas las rutas quedan bajo el prefijo global `/api`.

## Funcionalidad principal

Cuando se registra una mascota encontrada mediante `POST /api/found-pets`, el sistema:

1. guarda el registro en `found_pets`
2. busca mascotas perdidas activas (`is_active = true`) dentro de un radio de 500 metros
3. usa `ST_DWithin` con cast obligatorio a `::geography` para medir la distancia en metros
4. notifica por correo a los posibles matches encontrados

Tambien se agregaron endpoints cacheados con Redis:

- `GET /api/lost-pets`: lista de mascotas perdidas activas
- `GET /api/found-pets`: lista de mascotas encontradas

## Requisitos

- Node.js 22+
- npm 10+
- Docker y Docker Compose
- PostgreSQL con PostGIS
- Cuenta SMTP
- Token de Mapbox
- Connection string de Azure Application Insights opcional

## Variables de entorno

Puedes copiar `.env.example` a `.env` y ajustar los valores:

```bash
cp .env.example .env
```

Variables usadas por la aplicacion:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5433
DB_NAME=petradar
DB_USERNAME=postgres
DB_PASSWORD=postgres

MAPBOX_TOKEN=your-mapbox-token

MAILER_SERVICE=gmail
MAILER_EMAIL=your-email@example.com
MAILER_PASSWORD=your-app-password
GENERIC_NOTIFICATION_EMAIL=alerts@example.com

REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TTL_SECONDS=60

APPLICATIONINSIGHTS_CONNECTION_STRING=
```

## Levantar el proyecto con Docker Compose

Esto levanta PostGIS, Redis y la API:

```bash
docker compose up --build
```

La API quedara en `http://localhost:3000/api`.

El contenedor de la app ejecuta migraciones compiladas al arrancar mediante:

```bash
npm run start:prod:with-migrations
```

## Levantar el proyecto en local sin Docker para la app

1. Levanta dependencias:

```bash
docker compose up -d postgres redis
```

2. Instala dependencias:

```bash
npm install
```

3. Ejecuta migraciones:

```bash
npm run migration:run
```

4. Levanta la API en modo desarrollo:

```bash
npm run start:dev
```

## Probar los endpoints

### Registrar mascota perdida

```bash
curl -X POST http://localhost:3000/api/lost-pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Firulais",
    "species": "perro",
    "breed": "labrador",
    "color": "negro",
    "size": "mediano",
    "description": "Lleva un collar rojo",
    "photo_url": null,
    "owner_name": "Juan Perez",
    "owner_email": "juan@example.com",
    "owner_phone": "555-123-4567",
    "address": "Parque central",
    "lost_date": "2026-03-16T10:00:00.000Z",
    "lat": 19.4326,
    "lon": -99.1332
  }'
```

### Registrar mascota encontrada y disparar busqueda por radio

```bash
curl -X POST http://localhost:3000/api/found-pets \
  -H "Content-Type: application/json" \
  -d '{
    "species": "perro",
    "breed": "labrador",
    "color": "negro",
    "size": "mediano",
    "description": "Parece asustado pero sano",
    "photo_url": null,
    "finder_name": "Maria Lopez",
    "finder_email": "maria@example.com",
    "finder_phone": "555-987-6543",
    "address": "Parque central, zona norte",
    "found_date": "2026-03-16T12:30:00.000Z",
    "lat": 19.4327,
    "lon": -99.1331
  }'
```

La coincidencia se hace con `ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(...), 4326)::geography, 500)`.

### Consultar listados cacheados con Redis

```bash
curl http://localhost:3000/api/lost-pets
curl http://localhost:3000/api/found-pets
```

Para observar el efecto del cache:

1. llama dos veces seguidas al mismo `GET`
2. crea un nuevo registro con `POST`
3. repite el `GET`
4. verifica que el listado ya incluye el nuevo registro porque el cache se invalida tras cada alta

## Tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# cobertura
npm run test:cov
```

## Build y ejecucion Docker

Construir imagen:

```bash
docker build -t dfonsecapetsradar:local .
```

Ejecutar imagen local:

```bash
docker run --rm \
  --env-file .env \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5433 \
  -e REDIS_HOST=host.docker.internal \
  -e REDIS_PORT=6379 \
  -p 3000:3000 \
  dfonsecapetsradar:local \
  npm run start:prod:with-migrations
```

## GitHub Actions y GHCR

El workflow vive en `.github/workflows/docker-publish.yml` y realiza:

1. `npm ci`
2. `npm run build`
3. `npm test -- --runInBand`
4. build de imagen Docker
5. login a `ghcr.io`
6. push a `ghcr.io/<owner>/<repo>`

Se dispara en:

- `push` a `main`
- ejecucion manual con `workflow_dispatch`

Tags generados:

- `sha`
- nombre de rama
- `latest` en la rama principal

## Application Insights

La telemetria se activa solo si defines:

```env
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...;IngestionEndpoint=...
```

Si la variable esta vacia, la API funciona normalmente sin Application Insights.

## Infraestructura Azure (Terraform)

Este proyecto integra la infraestructura de [612-IncidentAPI-Infrastructure](https://github.com/JFRClasses/612-IncidentAPI-Infrastructure) adaptada para PetsRadar.

La carpeta `terraform/` provisiona en Azure (contenido de [612-IncidentAPI-Infrastructure](https://github.com/JFRClasses/612-IncidentAPI-Infrastructure)):

- Resource group
- Application Insights (telemetria)
- Linux VM con Docker y Docker Compose
- Red virtual, subnet, IP publica y reglas de seguridad (SSH, HTTP, HTTPS, API 3000)
- Guia de despliegue manual en `terraform/ansible.txt`
- Configuracion por contenedor en `deploy/containers/`

### Requisitos

- [Terraform](https://www.terraform.io/downloads) 1.5+
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) con sesion activa (`az login`)
- Clave SSH en `terraform/keys/petradar_key` y `terraform/keys/petradar_key.pub`

Si no existen las claves, genera un par nuevo:

```bash
mkdir -p terraform/keys
ssh-keygen -t ed25519 -f terraform/keys/petradar_key -C petradar-deploy
```

### Provisionar infraestructura

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edita terraform.tfvars con ENVIRONMENT, LOCATION y VM_SIZE

terraform init
terraform plan
terraform apply
```

Tras el despliegue:

```bash
terraform output public_ip
terraform output -raw app_insights_connection_string
```

Usa el connection string de Application Insights en el `.env` de produccion.

### Desplegar la API en la VM

Consulta la guia completa en `deploy/README.md`. Resumen:

1. SSH a la VM: `ssh -i terraform/keys/petradar_key adminuser@<PUBLIC_IP>`
2. Copia `deploy/compose.prod.yaml` y `deploy/.env` al servidor
3. Login en GHCR y levanta el stack:

```bash
docker login ghcr.io -u <username> -p <token>
docker compose up -d
```

La imagen de produccion se publica en `ghcr.io/davidf2004/proyecto-georeferenciados` mediante el workflow `.github/workflows/docker-publish.yml`.
