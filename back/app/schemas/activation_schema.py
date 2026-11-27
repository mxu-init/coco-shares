from pydantic import BaseModel


class ActivationRequest(BaseModel):
    token: str
    new_password: str
