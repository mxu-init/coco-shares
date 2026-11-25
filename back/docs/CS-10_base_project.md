# CS-10 · Proyecto base FastAPI + PostgreSQL

**Prioridad:** Highest

**Como** equipo de desarrollo, **quiero** un proyecto FastAPI con la estructura de los estándares y conectado a PostgreSQL local, **para** desarrollar todos sobre la misma base.

## Criterios de aceptación

1. Existe `back/` con `app/` (`main.py`, `api/`, `core/`, `models/`, `repositories/`, `schemas/`, `services/`), `tests/` (`conftest.py`, `features/`), `docs/`, `pytest.ini`, `requirements.txt`, `.gitignore` y `README.md`. Los archivos siguen el patrón `<entity>_<capa>.py`.
2. `core/` incluye `config.py`, conexión a BD, `enums.py`, `dependencies.py` y `seed.py`. Los enums se definen solo en `core/enums.py`.
3. `config.py` lee el `.env` con `pydantic-settings`. `.env.example` (sin valores reales) incluye `APP_NAME`, `APP_VERSION`, `APP_DESCRIPTION`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DRIVER_NAME=postgresql+psycopg`, `JWT_SECRET`, `JWT_EXPIRE_MINUTES`, `CORS_ORIGINS`, `UPLOAD_DIR`, datos SMTP, `REPRESENTATION_EMAIL` (vacío) y datos del primer admin. `.env` y `venv/` están ignorados por Git.
4. Stack fijado en `requirements.txt`: FastAPI, Uvicorn, SQLAlchemy 2.x, `psycopg` v3, `pydantic-settings`, `PyJWT`, `pwdlib[argon2]`, `python-multipart`, `pytest`, `httpx` y `pytest-bdd`. Requiere Python 3.10+ y PostgreSQL 14+.
5. Los modelos heredan de `DeclarativeBase`. Las tablas se crean al arrancar con `Base.metadata.create_all()`.
6. Los routers cuelgan de `api/api_router.py` bajo `/api/v1` y `main.py` incluye `api_router`. Swagger está en `/docs`.
7. Los errores de negocio (`NotFoundError`, `ConflictError`, `UnauthorizedError`, `PermissionDeniedError`) devuelven el código HTTP correcto con el mismo formato JSON (`{"detail": "..."}`) y el mensaje en español. `401` (sin autenticar) y `403` (sin permiso) se devuelven por separado.
8. `uvicorn app.main:app --reload` arranca y conecta con la BD local. Al arrancar, `seed.py` crea el primer `admin` si no existe.
9. `main.py` configura CORS con `CORSMiddleware` y los orígenes permitidos salen de `.env` (`CORS_ORIGINS`, por defecto `http://localhost:5173`).
10. Todos los schemas Pydantic devuelven claves en `snake_case`.
11. `require_roles(...)` en `core/dependencies.py` protege endpoints según el rol incluido en el JWT.
12. El README cubre clonar `coco-shares`, crear la BD, configurar el `.env`, crear y activar el venv (Windows y Linux/macOS), instalar `requirements.txt`, arrancar y ejecutar `pytest`.
13. Hay tests Gherkin (`pytest-bdd`) que pasan con `pytest`: estado del servicio, CORS, formato de errores, acceso por rol y seed del primer admin.
14. Código en inglés, sin comentarios y con type hints. Rama `feature/base_fastapi_project`, commits `feat(core): ...` y PR a `main` con una aprobación.

## Fuera de alcance

- Login (`POST /api/v1/auth/token`), usuarios, juntas, boletines y accionariado: van en sus propias historias.
- Roles de la maqueta: `shareholder`, `manager` y `admin` (Accionista, Manager y Administrador).
