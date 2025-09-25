# LeadBoxAI

Plataforma CRM omnicanal enfocada en la captación y nutrición de leads mediante mensajería (WhatsApp prioritario) con IA, automatizaciones, analítica y cumplimiento GDPR.

## Monorepo

- `apps/web`: Frontend Next.js 14 (App Router) con Tailwind, Zustand, react-hook-form y Socket.IO client.
- `apps/api`: Backend NestJS con Prisma, rate limiting, validación y gateway WebSocket.
- `packages/shared`: Tipos compartidos para clientes y servicios.

Gestionado con `pnpm` workspaces y Docker Compose para dependencias (PostgreSQL, Redis y MinIO).

## Requisitos previos

- Node.js 20+
- pnpm 8+
- Docker + Docker Compose

## Variables de entorno

Copia `.env.example` a `.env` y ajusta credenciales:

```bash
cp .env.example .env
```

Variables clave:

- `DATABASE_URL`: cadena de conexión PostgreSQL.
- `REDIS_URL`: Redis para colas BullMQ y sesiones Socket.IO.
- `S3_*`: credenciales de almacenamiento compatible S3 (MinIO en desarrollo).
- `JWT_*`: secretos para autenticación JWT.
- `WHATSAPP_*`: datos de WhatsApp Business Platform (Cloud API).
- `AI_*` y `TRANSLATION_*`: proveedores parametrizables para IA y traducción.

## Puesta en marcha

1. Levanta dependencias externas:

```bash
docker compose up -d
```

2. Instala dependencias e inicializa los paquetes:

```bash
pnpm install
```

3. Ejecuta migraciones y seeds (opcional):

```bash
pnpm --filter api prisma:generate
pnpm --filter api prisma:migrate
pnpm seed
```

4. Levanta frontend y backend en paralelo:

```bash
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:3001/api
- WebSocket: ws://localhost:3001

## Scripts principales

- `pnpm dev`: arranca `apps/web` y `apps/api` en modo desarrollo.
- `pnpm build`: compila todas las apps y paquetes.
- `pnpm test`: ejecuta pruebas (placeholders actualmente).
- `pnpm seed`: ejecuta `prisma/seed.ts` para datos demo.

## Estructura funcional (MVP)

- **Captación y Leads**: importaciones, formularios embebibles, scoring, asignación y etiquetado.
- **Bandeja omnicanal**: inbox en tiempo real con traducción, borradores IA y notas.
- **Automatizaciones**: disparadores/acciones tipo "si/entonces", SLA y reasignaciones.
- **Campañas opt-in**: segmentación dinámica, envíos escalonados, métricas de rendimiento.
- **Knowledge & Templates**: artículos versionados e indexados para IA, plantillas multi-idioma.
- **Analítica**: embudos, rendimiento de agentes, métricas de campañas.
- **Cumplimiento**: logs de consentimiento, auditoría, export/erase.

## WhatsApp Cloud API (alta rápida)

1. Crear app en Meta for Developers y vincular número en WhatsApp Business Platform.
2. Obtener `WHATSAPP_TOKEN`, `WHATSAPP_BUSINESS_ACCOUNT_ID` y registrar webhooks de mensajes.
3. Configurar plantillas aprobadas y sincronizarlas mediante el provider abstracto.

## Roadmap inmediato

- Persistencia real conectada a Prisma y colas BullMQ para envíos masivos.
- Implementar RBAC y guardias NestJS con decoradores por rol.
- Integración completa de traducción y proveedores IA.
- Tests automatizados (Jest, Playwright, k6) y pipelines CI/CD.
- Exportación/anonimización GDPR desde endpoints de Contacto.

## Licencia

MIT
