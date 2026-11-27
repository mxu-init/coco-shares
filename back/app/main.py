from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.api_router import api_router
from app.core.config import settings
from app.core.exceptions import (
    AppError,
    ConflictError,
    NotFoundError,
    PermissionDeniedError,
    UnauthorizedError,
    InvalidDataError
)

ERROR_STATUS_CODES: dict[type[AppError], int] = {
    NotFoundError: status.HTTP_404_NOT_FOUND,
    ConflictError: status.HTTP_409_CONFLICT,
    UnauthorizedError: status.HTTP_401_UNAUTHORIZED,
    PermissionDeniedError: status.HTTP_403_FORBIDDEN,
    InvalidDataError: status.HTTP_422_UNPROCESSABLE_ENTITY,
}
UNAUTHORIZED_HEADERS = {"WWW-Authenticate": "Bearer"}
INVALID_DATA_MESSAGE = "Los datos enviados no son válidos"


async def handle_app_error(_: Request, error: AppError) -> JSONResponse:
    status_code = ERROR_STATUS_CODES.get(type(error), status.HTTP_500_INTERNAL_SERVER_ERROR)
    headers = UNAUTHORIZED_HEADERS if status_code == status.HTTP_401_UNAUTHORIZED else None
    return JSONResponse(status_code=status_code, content={"detail": error.message}, headers=headers)


async def handle_validation_error(_: Request, error: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": INVALID_DATA_MESSAGE, "errors": jsonable_encoder(error.errors())},
    )


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=settings.APP_DESCRIPTION,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_exception_handler(AppError, handle_app_error)
app.add_exception_handler(RequestValidationError, handle_validation_error)
app.include_router(api_router)
