from app.core.database import SessionLocal
from seeders.initial_data_seeder import seed_initial_data

SEED_COMPLETED_MESSAGE = "Datos iniciales cargados correctamente"


def run_seeders() -> None:
    with SessionLocal() as session:
        seed_initial_data(session)
    print(SEED_COMPLETED_MESSAGE)


if __name__ == "__main__":
    run_seeders()
