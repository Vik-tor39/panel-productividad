# Panel de Productividad (Sistema B)

Dashboard que recibe eventos de tareas completadas desde **Sistema A (Gestor de Tareas)**, los desencripta, los valida y actualiza estadísticas de productividad (tareas completadas por usuario y por día).

Proyecto académico del curso **Desarrollo de Software Seguro (UDLA)**.

## Descripción

Sistema A cifra cada evento de tarea completada con HashiCorp Vault (Transit engine) antes de enviarlo. Sistema B expone un endpoint receptor que:

1. Valida el JWT del request contra Keycloak.
2. Desencripta el `ciphertext` recibido usando Vault Transit.
3. Valida el JSON resultante contra un schema estricto (Zod).
4. Persiste el evento y actualiza contadores agregados.

Este sistema **no implementa autenticación propia** (delega SSO, 2FA y roles a Keycloak) ni **cifrado propio** (usa Vault Transit como KMS centralizado). Ambos son infraestructura compartida con Sistema A y corren en un repositorio aparte.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite |
| Backend | Node.js + Express |
| Auth | Keycloak (OIDC/OAuth2) vía `keycloak-js` + `jwks-rsa` |
| Persistencia | SQLite (`node:sqlite`) |
| KMS | HashiCorp Vault (Transit engine) vía `node-vault` |
| Validación | Zod |

## Arquitectura

```
routes/ → controllers/ → services/ → repositories/
```

- **Middleware**: valida el JWT primero; el controller nunca procesa el ciphertext antes de esa validación.
- **Controller**: HTTP puro, delega a services y responde con los códigos fijos del contrato de integración.
- **Service**: `encryptionService.js` (descifrado vía Vault Transit) y `statsService.js` (agregación de contadores).
- **Repository**: único punto de acceso a SQLite.

## Requisitos previos

Este sistema depende de infraestructura central **compartida con Sistema A**, que debe estar levantada de antemano (no se dockeriza en este repo):

- **Keycloak** — SSO/2FA/roles (realm `plataforma-integrada`).
- **HashiCorp Vault** — Transit engine habilitado con la llave `plataforma-key`.
- **OpenLDAP** — federación de usuarios (consumido por Keycloak).

También:

- Node.js >= 22.5.0 (usa el módulo nativo `node:sqlite`).

## Instalación y ejecución

### Backend

```bash
cd backend
npm install
cp .env.example .env   # completar con los valores reales de la infraestructura central
npm run dev             # node --watch src/index.js en :3000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # completar VITE_KEYCLOAK_URL, etc.
npm run dev              # Vite en :5173
```

## Variables de entorno

### Backend (`backend/.env`)

```
KEYCLOAK_URL=http://<IP-CENTRAL>:8080
KEYCLOAK_REALM=plataforma-integrada
KEYCLOAK_CLIENT_ID=sistema-b

VAULT_ADDR=http://<IP-CENTRAL>:8200
VAULT_TOKEN=vault_root_token
VAULT_TRANSIT_KEY=plataforma-key

FRONTEND_ORIGIN=http://localhost:5173
PORT=3000

DB_PATH=./data/panel.sqlite
```

> `VAULT_TRANSIT_KEY` debe apuntar siempre a la misma llave (`plataforma-key`) que usa Sistema A, o el descifrado fallará.

### Frontend (`frontend/.env`)

```
VITE_KEYCLOAK_URL=http://<IP-CENTRAL>:8080
VITE_KEYCLOAK_REALM=plataforma-integrada
VITE_KEYCLOAK_CLIENT_ID=sistema-b

VITE_API_BASE_URL=http://localhost:3000/api
```

## API

```
GET  /api/health                    → { ok, ts }
POST /api/integration/receive        → recibe evento cifrado de Sistema A [requiere JWT]
GET  /api/stats/summary              → { completadas_hoy, por_usuario, por_dia } [requiere JWT, role: user]
GET  /api/stats/admin                → estadísticas extendidas [requiere JWT, role: admin]
```

### Contrato del endpoint receptor

```
POST /api/integration/receive
Content-Type: application/json
Authorization: Bearer <JWT del usuario>

Body: { "ciphertext": "vault:v1:..." }
```

| Código | Caso |
|---|---|
| 201 | `{ "status": "received", "id": "<id-interno>" }` |
| 400 | `{ "error": "invalid_payload" }` — falta `ciphertext` o no tiene formato `vault:v1:...` |
| 401 | `{ "error": "unauthorized" }` — JWT inválido o ausente |
| 422 | `{ "error": "schema_validation_failed" }` — el payload desencriptado no cumple el schema |
| 502 | `{ "error": "kms_unavailable" }` — Vault no responde |

> **Importante:** este contrato (códigos de respuesta, schema del evento, nombre de la llave Vault) es crítico para la integración con Sistema A. No debe modificarse sin coordinar antes con ese equipo. Ver [CLAUDE.md](./CLAUDE.md) para el detalle completo.

## Estructura del proyecto

```
backend/
  src/
    config/        # carga y validación de variables de entorno
    middleware/     # validación JWT
    routes/         # definición de endpoints
    controllers/    # HTTP puro
    services/       # descifrado (Vault) y agregación de estadísticas
    repositories/   # acceso a SQLite
    schemas/        # schemas Zod
frontend/
  src/
    api/            # cliente HTTP hacia el backend
    components/     # Dashboard, AdminPanel, StatCard
    keycloak.js      # inicialización de keycloak-js
```

## Notas de seguridad

- Todo el flujo de autenticación pasa por Keycloak vía validación de JWT contra JWKS — no hay login propio.
- El endpoint receptor es estricto: rechaza cualquier payload que no cumpla exactamente el schema esperado, sin intentar normalizar o adivinar datos mal formados. No se persisten datos parciales.
- El cifrado/descifrado se delega completamente a Vault Transit; el backend nunca maneja claves criptográficas directamente.
