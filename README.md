# Filmarchiv

Filmarchiv ist eine Webanwendung zur Verwaltung und Erkundung von Filmen. Das Projekt
entstand als Gruppenarbeit im Fach *Software Engineering*. Die Beispieldomäne
verknüpft Filme mit ihren Schauspielerinnen und Schauspielern sowie jeweils einem
Drehbuch.

## Die App im Überblick

<p align="center">
  <a href="https://github.com/user-attachments/assets/d4612b01-b778-4f3f-8c1d-cabca9ab8f5c">
    <img src="https://github.com/user-attachments/assets/d4612b01-b778-4f3f-8c1d-cabca9ab8f5c" alt="Landing Page des Filmarchivs" width="800">
  </a>
</p>

<table>
  <tr>
    <td width="50%">
      <img src="https://github.com/user-attachments/assets/11aabe46-f169-462f-8fb9-6143bf3c6ec7" alt="Filmdetails" width="100%">
    </td>
    <td width="50%">
      <img src="https://github.com/user-attachments/assets/15fffe85-8aa5-4724-aa0a-c5bdfe6e1910" alt="Wer spielt mit?" width="100%">
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="https://github.com/user-attachments/assets/e0fa34bf-2539-4ef3-8190-70f8912564eb" alt="Schauspieler" width="100%">
    </td>
    <td width="50%">
      <img src="https://github.com/user-attachments/assets/2ccdde02-22e5-4ef0-80c4-60eef7bfb658" alt="Drehbuch" width="100%">
    </td>
  </tr>
</table>


## Funktionen

- Responsives Web-Frontend unter `/` mit Filmliste und Suche nach Filmtitel,
  Erscheinungsjahr, Besetzung und Drehbuch.
- Klickbare Besetzungslisten mit Detailansicht für einzelne Schauspieler.
- Drehbuchdetails mit Titel, Autor, Seitenzahl und zugehörigem Film.
- REST- und GraphQL-Schnittstellen für Filmdaten.
- Authentifizierung und rollenbasierte Autorisierung über Keycloak.

## Technologie

- Python 3.15 und [uv](https://docs.astral.sh/uv/)
- [FastAPI](https://fastapi.tiangolo.com/) und Pydantic
- [SQLAlchemy](https://www.sqlalchemy.org/) mit PostgreSQL
- [Strawberry GraphQL](https://strawberry.rocks/)
- Keycloak für OpenID Connect und OAuth 2
- HTML, CSS und JavaScript für das Frontend
- pytest, Ruff und MkDocs für Tests, Qualitätssicherung und Dokumentation

## Schnellstart

Voraussetzung ist eine installierte Python-Version gemäß `pyproject.toml` und `uv`.
Die Anwendung benötigt PostgreSQL sowie – abhängig von der verwendeten Funktion –
Keycloak und einen Mailserver. Konfiguration und ausführliche Installationsschritte
stehen in der [Installationsanleitung](README.install.md).

```powershell
uv sync --all-groups
uv run film
```

Nach dem Start:

- Filmarchiv: <https://localhost:8000/>
- REST-API-Dokumentation: <https://localhost:8000/docs>
- GraphQL: <https://localhost:8000/graphql>
- Liveness: <https://localhost:8000/health/liveness>
- Readiness (einschließlich Datenbank): <https://localhost:8000/health/readiness>

Der lokale Entwicklungsserver verwendet HTTPS. Beim ersten Aufruf kann der Browser
eine Warnung für das lokale TLS-Zertifikat anzeigen.

## API-Überblick

| Methode | Pfad | Beschreibung |
| --- | --- | --- |
| `GET` | `/rest/filme` | Alle Filme einschließlich Schauspielern und Drehbüchern abrufen |
| `GET` | `/rest/filme/{film_id}` | Einen Film anhand seiner ID abrufen |
| `POST` | `/rest/filme` | Einen Film mit Besetzung und Drehbuch anlegen |
| `PUT` | `/rest/filme/{film_id}` | Filmdaten aktualisieren; erfordert passende Rolle und `If-Match` |
| `DELETE` | `/rest/filme/{film_id}` | Einen Film löschen; erfordert passende Rolle |
| `POST` | `/graphql` | GraphQL-Queries und -Mutations ausführen |

Die REST-Endpunkte sind unter `/docs` interaktiv dokumentiert. Die GraphQL-Schnittstelle
ist unter `/graphql` erreichbar; verfügbarer Funktionsumfang und Authentifizierung
unterscheiden sich je nach Query beziehungsweise Mutation.

## Tests und Codequalität

Für die Unit- und Integrationstests:

```powershell
uv run pytest
```

Die Integrationstests benötigen einen laufenden Appserver und die zugehörigen
Backend-Dienste. Eine gezielte Ausführung der Service-Unit-Tests ist beispielsweise:

```powershell
uv run pytest tests/unit/film/service
```

Formatierung und statische Prüfung:

```powershell
ruff check src tests
ruff format --check src tests
```

## Dokumentation und Projektstruktur

Die Architektur- und API-Dokumentation liegt unter [`docs/`](docs/); sie kann mit
MkDocs lokal gestartet werden:

```powershell
uv run mkdocs serve
```

Der MkDocs-Server verwendet standardmäßig ebenfalls Port `8000`. Beende deshalb den
Appserver, bevor du die Dokumentation startest.

- [`src/film/`](src/film/) – FastAPI-Anwendung, REST- und GraphQL-Schnittstellen,
  Geschäftslogik, Datenzugriff und Frontend
- [`tests/`](tests/) – Unit- und Integrationstests
- [`extras/`](extras/) – Konfigurationen und Ressourcen, unter anderem für Compose und
  Bruno
- [`docs/`](docs/) – Use Cases, Architekturdiagramme und API-Dokumentation
- [`README.install.md`](README.install.md) – detaillierte Installation und Betrieb

## Mitwirkende

- Mael Akin
- Moritz Büsener
- Jürgen Zimmermann

## Lizenz

Dieses Projekt steht unter der [GNU General Public License v3.0 oder neuer](LICENSE).
