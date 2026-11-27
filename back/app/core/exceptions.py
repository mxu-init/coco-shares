class AppError(Exception):
    default_message = "Se ha producido un error inesperado"

    def __init__(self, message: str | None = None) -> None:
        self.message = message or self.default_message
        super().__init__(self.message)


class NotFoundError(AppError):
    default_message = "Recurso no encontrado"


class ConflictError(AppError):
    default_message = "El recurso ya existe"


class UnauthorizedError(AppError):
    default_message = "No has iniciado sesión"


class PermissionDeniedError(AppError):
    default_message = "No tienes permiso para realizar esta acción"

class InvalidDataError(AppError):
    default_message = "Los datos enviados no son válidos"