# COCO-SHARES · Backend

API FastAPI + PostgreSQL del portal del accionista de CoHispania. Sigue la guía `codingStandards_back.md`.

## Requisitos

- Python 3.10 o superior
- PostgreSQL 14 o superior (con pgAdmin)
- Git

## Puesta en marcha

Todos los comandos se ejecutan dentro de `back/`.

1. **Clonar el repositorio**

   ```
   git clone https://github.com/mxu-init/coco-shares.git
   cd coco-shares/back
   ```

2. **Crear la base de datos** desde pgAdmin (por ejemplo `coco_shares`).

3. **Configurar el `.env`**: copia `.env.example` a `.env` y rellena al menos `DB_NAME`, `DB_PASSWORD`, `JWT_SECRET`, `ADMIN_EMAIL` y `ADMIN_PASSWORD`. El `.env` nunca se sube al repositorio.

4. **Crear el entorno virtual**

   ```
   python -m venv venv
   ```

5. **Activar el entorno virtual**

   | Sistema | Comando |
   |---|---|
   | Windows (Git Bash) | `source venv/Scripts/activate` |
   | Windows (PowerShell) | `venv\Scripts\Activate.ps1` |
   | Linux / macOS | `source venv/bin/activate` |

6. **Instalar dependencias**

   ```
   python -m pip install -r requirements.txt
   ```

7. **Arrancar el servidor**

   ```
   uvicorn app.main:app --reload
   ```

   Al arrancar se crean las tablas y el primer administrador (`ADMIN_EMAIL`). Si la conexión con la base de datos falla, el arranque se detiene con el error.

8. **Comprobar**

   - Swagger: <http://localhost:8000/docs>
   - Estado del servicio: <http://localhost:8000/api/v1/health>

## Tests

```
pytest
```

Los tests usan escenarios Gherkin (`tests/features/`) y una base de datos temporal en memoria; no necesitan PostgreSQL.

## Estructura

```
app/
├── main.py            app, CORS, manejo de errores y arranque
├── api/               routers + api_router.py (/api/v1)
├── core/              config, BD, enums, dependencias, seguridad, excepciones, seed
├── models/            modelos SQLAlchemy
├── repositories/      consultas a la base de datos
├── schemas/           schemas Pydantic
└── services/          lógica de negocio
tests/
├── conftest.py
└── features/
```

Cada entidad nueva sigue el patrón `<entity>_<capa>.py`.

## Errores de la API

Todos los errores de negocio devuelven el mismo formato, con el mensaje en español:

```json
{ "detail": "Recurso no encontrado" }
```

`401` indica que no hay sesión válida y `403` que hay sesión pero no permiso. Los errores `422` añaden el campo `errors` con el detalle de cada campo.
