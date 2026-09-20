# lassoDB

Weboberfläche für das Werkverzeichnis von Orlando di Lasso. Dieses Repository
enthält nur die Anwendung. Der eigentliche Datenbestand liegt getrennt in
[lassoDBData](https://github.com/nikilachniki/lassoDBData), zusammen mit dem
Begründungsprotokoll [docs/entscheidungen.md](https://github.com/nikilachniki/lassoDBData/blob/main/docs/entscheidungen.md)
zu allen Technologieentscheidungen dieses Projekts.

Technisch: Vite, React, TypeScript, MUI mit der DataGrid-Komponente. Reine
statische Auslieferung ohne Server oder Datenbank, Auslieferung über GitHub
Pages.

## Wie die Daten hierherkommen

Es gibt keine eigene Kopie der Daten in diesem Repository. Stattdessen holt
`scripts/sync-data.mjs` bei jedem Start die erzeugten JSON-LD-Dateien aus
lassoDBData und legt sie nach `src/data/`, von wo sie ins Bundle eingebunden
werden. Der Ordner ist entsprechend in `.gitignore` eingetragen.

Lokal wird angenommen, dass lassoDBData als Geschwisterordner neben diesem
Projekt liegt:

```
IdeaProjects/
├── lassoDB/
└── lassoDBData/
```

Liegt es woanders, zeigt `LASSO_DATA_DIR` auf den passenden `data/`-Ordner.

## Entwicklung

Voraussetzung ist Node.js, empfohlen die aktuelle LTS-Version.

```bash
npm install
npm run dev
```

`npm run dev` und `npm run build` synchronisieren die Daten automatisch vorab.
Bei Bedarf lässt sich das auch einzeln ausführen:

```bash
npm run sync-data
```

## Deployment

Der Workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml)
checkt bei jedem Push nach main zusätzlich lassoDBData aus, baut die
Anwendung mit dessen aktuellem Datenstand und veröffentlicht sie auf GitHub
Pages.

Damit das greift, muss in den Repository-Einstellungen unter **Settings →
Pages → Source** einmalig **GitHub Actions** ausgewählt werden, das lässt
sich nicht per Push auslösen.

In der frühen Phase wird gegen den `main`-Branch von lassoDBData gebaut, ohne
Versionspinnung. Sobald sich das Datenschema stabilisiert hat, wird der
Checkout auf ein festes Tag umgestellt.
