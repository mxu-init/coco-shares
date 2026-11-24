from pydantic import BaseModel, ConfigDict


class TestCreate(BaseModel):
    test_name: str
    test_type: str


class TestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    test_name: str
    test_type: str
