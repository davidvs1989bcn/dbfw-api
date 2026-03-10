# 🐉 Dragon Ball Fusion World TCG - REST API

API REST completa para el catálogo de cartas del juego **Dragon Ball Super Card Game: Fusion World**.

## ✨ Features diferenciales

- **Catálogo completo** con +800 cartas de todos los sets oficiales
- **Deck Builder** con validación automática de reglas oficiales (50 cartas, máx 4 copias, color matching)
- **Sistema de ratings** (1-5 estrellas) por la comunidad
- **Tags colaborativos** (meta, budget, staple, combo-piece...)
- **Sinergias** entre cartas con sistema de votos
- **Analytics del meta**: top cartas, distribución de colores, curva de coste, popularidad por set
- **Auth JWT** con roles (admin/user)
- **Rate limiting** para proteger la API
- **Paginación** en todos los listados

## 🛠 Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de datos**: MySQL (XAMPP)
- **Auth**: JWT + bcrypt
- **Arquitectura**: Capas (routes → controllers → services → db)

## 🚀 Instalación

### 1. Clonar y dependencias

```bash
cd dbfw-api
npm install
```

### 2. Configurar entorno

```bash
copy .env.example .env
```

Editar `.env` con tus datos de MySQL (por defecto XAMPP: root sin password).

### 3. Crear base de datos y tablas

Asegúrate de que XAMPP/MySQL está corriendo, luego:

```bash
npm run seed:db
```

Esto crea la BD `dbfw_api`, todas las tablas, y un usuario admin (`admin@dbfw.com` / `admin123`).

### 4. Poblar con cartas reales

```bash
npm run seed:cards
```

Descarga todas las cartas desde apitcg.com y las inserta en tu BD local.

### 5. Arrancar

```bash
npm run dev
```

La API estará en `http://localhost:3000`

## 📖 Endpoints

### Auth
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | ❌ | Registrar usuario |
| POST | `/api/auth/login` | ❌ | Login (devuelve JWT) |
| GET | `/api/auth/profile` | ✅ | Mi perfil + stats |
| POST | `/api/auth/logout` | ✅ | Cerrar sesión |

### Cards (Catálogo)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/cards` | ❌ | Listar con filtros y paginación |
| GET | `/api/cards/search?q=goku` | ❌ | Búsqueda por texto |
| GET | `/api/cards/:id` | ❌ | Detalle con tags, sinergias, rating |
| POST | `/api/cards` | 🔑 Admin | Crear carta |
| PUT | `/api/cards/:id` | 🔑 Admin | Actualizar carta |
| DELETE | `/api/cards/:id` | 🔑 Admin | Eliminar carta |

**Filtros disponibles en GET /api/cards:**
`name`, `color`, `card_type`, `rarity`, `set_id`, `cost`, `min_power`, `max_power`, `features`, `effect`, `page`, `limit`

### Sets
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/sets` | ❌ | Todos los sets |
| GET | `/api/sets/:id` | ❌ | Detalle de set |
| POST | `/api/sets` | 🔑 Admin | Crear set |
| PUT | `/api/sets/:id` | 🔑 Admin | Actualizar set |
| DELETE | `/api/sets/:id` | 🔑 Admin | Eliminar set |

### Decks (Deck Builder)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/decks` | ❌ | Mazos públicos |
| GET | `/api/decks/me/list` | ✅ | Mis mazos |
| GET | `/api/decks/:id` | ❌/✅ | Detalle + cartas + stats |
| GET | `/api/decks/:id/validate` | ❌ | Validar reglas oficiales |
| POST | `/api/decks` | ✅ | Crear mazo |
| POST | `/api/decks/:id/cards` | ✅ | Añadir cartas |
| DELETE | `/api/decks/:id/cards/:cardId` | ✅ | Quitar carta |
| DELETE | `/api/decks/:id` | ✅ | Eliminar mazo |

### Community (Ratings, Tags, Sinergias)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/community/cards/:cardId/rate` | ✅ | Valorar carta (1-5) |
| GET | `/api/community/cards/:cardId/ratings` | ❌ | Ver ratings |
| DELETE | `/api/community/cards/:cardId/rate` | ✅ | Eliminar mi rating |
| POST | `/api/community/cards/:cardId/tags` | ✅ | Añadir tag |
| DELETE | `/api/community/cards/:cardId/tags/:tag` | ✅ | Eliminar tag |
| POST | `/api/community/synergies` | ✅ | Crear sinergia |
| POST | `/api/community/synergies/:id/vote` | ✅ | Votar sinergia |

### Analytics
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/analytics/top-used` | Top cartas más usadas en mazos |
| GET | `/api/analytics/top-rated` | Top cartas mejor valoradas |
| GET | `/api/analytics/colors` | Distribución de colores en el meta |
| GET | `/api/analytics/stats` | Stats generales de la plataforma |
| GET | `/api/analytics/sets` | Stats desglosadas por set |
| GET | `/api/analytics/rarity` | Distribución de rareza |
| GET | `/api/analytics/tags` | Tags más populares |
| GET | `/api/analytics/cost-curve` | Curva de coste media |

## 🧪 Ejemplos con curl (CMD)

### Registro
```bash
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"username\":\"goku\",\"email\":\"goku@capsule.com\",\"password\":\"kamehameha\"}"
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"goku@capsule.com\",\"password\":\"kamehameha\"}"
```

### Buscar cartas rojas SR
```bash
curl "http://localhost:3000/api/cards?color=Red&rarity=SR&limit=10"
```

### Buscar por nombre
```bash
curl "http://localhost:3000/api/cards/search?q=vegeta"
```

### Crear mazo (con token)
```bash
curl -X POST http://localhost:3000/api/decks -H "Content-Type: application/json" -H "Authorization: Bearer TU_TOKEN" -d "{\"name\":\"Red Aggro\",\"leader_card_id\":\"FB01-001\"}"
```

### Valorar carta
```bash
curl -X POST http://localhost:3000/api/community/cards/FB01-001/rate -H "Content-Type: application/json" -H "Authorization: Bearer TU_TOKEN" -d "{\"score\":5,\"comment\":\"Mejor lider red\"}"
```

## 📁 Estructura del proyecto

```
dbfw-api/
├── package.json
├── .env.example
├── .gitignore
├── database/
│   ├── schema.sql          # Esquema SQL completo
│   └── runSchema.js        # Script para crear BD y tablas
├── seed/
│   └── fetchCards.js       # Descarga cartas de apitcg.com
└── src/
    ├── index.js            # Entry point + Express setup
    ├── config/
    │   └── db.js           # Pool de conexión MySQL
    ├── middleware/
    │   ├── auth.js         # JWT auth + optional auth
    │   └── roleCheck.js    # Verificación de rol
    ├── routes/
    │   ├── auth.routes.js
    │   ├── card.routes.js
    │   ├── set.routes.js
    │   ├── deck.routes.js
    │   ├── rating.routes.js
    │   └── analytics.routes.js
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── card.controller.js
    │   ├── set.controller.js
    │   ├── deck.controller.js
    │   ├── rating.controller.js
    │   └── analytics.controller.js
    ├── services/
    │   ├── auth.service.js
    │   ├── card.service.js
    │   ├── set.service.js
    │   ├── deck.service.js
    │   ├── rating.service.js
    │   └── analytics.service.js
    └── utils/
        ├── pagination.js    # Helper de paginación
        └── deckValidator.js # Validador de reglas oficiales
```

## 📝 Licencia

MIT
