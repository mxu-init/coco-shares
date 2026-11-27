from sqlalchemy.orm import Session

from app.core.enums import PageKey
from app.models.page_content_model import PageContent
from app.repositories import page_content_repository

DEFAULT_LEGAL_TERMS_TITLE = "Marco legal"
DEFAULT_LEGAL_TERMS_BODY = (
    "Conforme al artículo 11 bis de la Ley 1/2012, de 22 de junio, CoHispania pone a disposición de sus "
    "accionistas esta web corporativa para facilitar el acceso a las convocatorias de las Juntas Generales, "
    "a su documentación y a las actas posteriores a su celebración."
)

NO_ACTIVE_MEETING_TITLE = "No hay ninguna junta convocada"
NO_ACTIVE_MEETING_BODY = (
    "A la fecha de hoy, el Consejo de Administración no ha convocado ninguna Junta General de Accionistas. "
    "Antes de publicar cualquier junta en este portal, le enviaremos un correo electrónico o, en su defecto, "
    "una comunicación escrita."
)

DEFAULT_ANNOUNCEMENT_TITLE = "Anuncio de convocatoria"
DEFAULT_ANNOUNCEMENT_BODY = """Estimado socio:

El Consejo de Administración de Compañía Hispania de Tasaciones y Valoraciones, S.A., en su reunión de fecha [fecha de la reunión del Consejo], ha acordado convocar Junta General Ordinaria de Socios, que se celebrará, en primera convocatoria, el día [fecha de la 1.ª convocatoria], a las [hora], en [lugar], y en segunda convocatoria, el día [fecha de la 2.ª convocatoria], a las [hora], en [lugar], con arreglo al Orden del día que figura en la documentación restringida a los accionistas (acceda a la parte privada para ver esta documentación).

Igualmente le indicamos que tiene a su disposición toda la documentación relativa a dicha convocatoria, que podrá revisar y analizar haciendo clic en cada uno de los enlaces.

En el caso de que no pueda asistir a la Junta pero quiera estar representado, puede hacer uso del Boletín de Representación siguiendo los siguientes pasos:
- Imprima el Boletín.
- Indique el nombre y apellidos de la persona en quien delega.
- Indique el DNI de la persona en quien delega.
- Marque con una «X» en las columnas «A favor» o «En contra» de cada uno de los puntos del Orden del día.
- Ponga su nombre y apellidos y fírmelo.

Le recordamos que, para que el Boletín de Representación tenga validez a los efectos de voto, deberá estar debidamente cumplimentado y firmado por usted y por la persona que le represente, y entregado al Secretario de la Junta antes del inicio de la misma."""

INITIAL_PAGE_CONTENTS = {
    PageKey.DEFAULT_LEGAL_TERMS: (DEFAULT_LEGAL_TERMS_TITLE, DEFAULT_LEGAL_TERMS_BODY),
    PageKey.NO_ACTIVE_MEETING: (NO_ACTIVE_MEETING_TITLE, NO_ACTIVE_MEETING_BODY),
    PageKey.DEFAULT_ANNOUNCEMENT: (DEFAULT_ANNOUNCEMENT_TITLE, DEFAULT_ANNOUNCEMENT_BODY),
}


def seed_page_contents(session: Session) -> None:
    for page_key, (title, body) in INITIAL_PAGE_CONTENTS.items():
        if page_content_repository.find_by_page_key(session, page_key) is None:
            page_content_repository.add(session, PageContent(page_key=page_key, title=title, body=body))
