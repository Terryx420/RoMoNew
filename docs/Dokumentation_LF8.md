# Projektdokumentation RocketMoon (RoMo)

**Projektthema:** Datenvisualisierung von Raketenstarts und Mondphasen
**Lernfeld:** LF 8 - Daten systemübergreifend bereitstellen
**Berufsschule:** Technik - Hanse- und Universitätsstadt Rostock

---

## 1. Klassendiagramm (UML-Notation)

Das folgende Klassendiagramm zeigt die Kernklassen der Anwendung mit ihren Attributen, Methoden und Beziehungen.

```
┌─────────────────────────────────────────┐
│           <<enumeration>>               │
│            LaunchStatus                 │
├─────────────────────────────────────────┤
│  Success                                │
│  Failure                                │
│  Partial                                │
│  TBD                                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           <<enumeration>>               │
│             MoonPhase                   │
├─────────────────────────────────────────┤
│  NewMoon                                │
│  FirstQuarter                           │
│  FullMoon                               │
│  LastQuarter                            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│            RocketLaunch                 │
├─────────────────────────────────────────┤
│  - Id: int <<PK>>                       │
│  - Name: string                         │
│  - LaunchDate: DateTime                 │
│  - Status: LaunchStatus                 │
│  - Agency: string                       │
│  - RocketType: string                   │
│  - ExternalId: string?                  │
├─────────────────────────────────────────┤
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│              MoonData                   │
├─────────────────────────────────────────┤
│  - Id: int <<PK>>                       │
│  - Phase: MoonPhase                     │
│  - Date: DateTime                       │
│  - Year: int                            │
├─────────────────────────────────────────┤
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│            AppDbContext                 │
├─────────────────────────────────────────┤
│  + RocketLaunches: DbSet<RocketLaunch>  │
│  + MoonPhases: DbSet<MoonData>          │
├─────────────────────────────────────────┤
│  # OnModelCreating(builder): void       │
└─────────────────────────────────────────┘
         ◇                    ◇
         │1                   │1
         │                    │
         │*                   │*
┌────────┴────────┐  ┌────────┴────────┐
│  RocketLaunch   │  │    MoonData     │
└─────────────────┘  └─────────────────┘

┌─────────────────────────────────────────┐
│         RocketLaunchService             │
├─────────────────────────────────────────┤
│  - _httpClient: HttpClient              │
│  - _context: AppDbContext               │
│  - _logger: ILogger                     │
├─────────────────────────────────────────┤
│  + GetAvailableYearsAsync(): List<int>  │
│  + FetchAndSaveLaunchesAsync(year: int) │
│    : List<RocketLaunch>                 │
│  + GetLaunchesForYearAsync(year: int)   │
│    : List<RocketLaunch>                 │
│  - MapStatusToEnum(status: string)      │
│    : LaunchStatus                       │
└─────────────────────────────────────────┘
              │
              │ benutzt
              ▼
┌─────────────────────────────────────────┐
│            AppDbContext                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          MoonDataService                │
├─────────────────────────────────────────┤
│  - _httpClient: HttpClient              │
│  - _context: AppDbContext               │
│  - _logger: ILogger                     │
├─────────────────────────────────────────┤
│  + FetchAndSaveMoonPhasesAsync(year)    │
│    : List<MoonData>                     │
│  + GetMoonPhasesForYearAsync(year: int) │
│    : List<MoonData>                     │
│  - MapPhaseStringToEnum(phase: string)  │
│    : MoonPhase                          │
└─────────────────────────────────────────┘
              │
              │ benutzt
              ▼
┌─────────────────────────────────────────┐
│            AppDbContext                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│        ChartAnalysisService             │
├─────────────────────────────────────────┤
│  - _context: AppDbContext               │
│  - _logger: ILogger                     │
├─────────────────────────────────────────┤
│  + GetSuccessRateByMoonPhaseAsync(year) │
│    : MoonPhaseSuccessChartDTO           │
│  + GetLaunchStatusDistributionAsync()   │
│    : LaunchStatusChartDTO               │
│  + GetLaunchTimelineAsync(year: int)    │
│    : LaunchTimelineChartDTO             │
│  - FindClosestMoonPhase(date, phases)   │
│    : MoonData                           │
│  - CalculateSuccessRate(launches)       │
│    : decimal                            │
└─────────────────────────────────────────┘
              │
              │ benutzt
              ▼
┌─────────────────────────────────────────┐
│            AppDbContext                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           ChartController               │
├─────────────────────────────────────────┤
│  - _launchService: RocketLaunchService  │
│  - _moonService: MoonDataService        │
│  - _chartService: ChartAnalysisService  │
│  - _logger: ILogger                     │
├─────────────────────────────────────────┤
│  + GetAvailableYears(): List<int>       │
│  + InitializeData(year: int): IResult   │
│  + GetMoonPhaseSuccess(year: int)       │
│    : MoonPhaseSuccessChartDTO           │
│  + GetLaunchStatus(year: int)           │
│    : LaunchStatusChartDTO               │
│  + GetLaunchTimeline(year: int)         │
│    : LaunchTimelineChartDTO             │
└─────────────────────────────────────────┘
       │         │         │
       │         │         │
       ▼         ▼         ▼
┌──────────┐ ┌────────┐ ┌──────────┐
│RocketLau-│ │MoonData│ │ChartAnaly│
│nchService│ │Service │ │sisService│
└──────────┘ └────────┘ └──────────┘
```

### Klassenbeziehungen

| Beziehung | Typ | Beschreibung |
|-----------|-----|--------------|
| AppDbContext → RocketLaunch | Aggregation (1:*) | Enthält mehrere Raketenstarts |
| AppDbContext → MoonData | Aggregation (1:*) | Enthält mehrere Mondphasen |
| RocketLaunchService → AppDbContext | Assoziation | Nutzt für Datenbankzugriff |
| MoonDataService → AppDbContext | Assoziation | Nutzt für Datenbankzugriff |
| ChartAnalysisService → AppDbContext | Assoziation | Nutzt für Datenbankzugriff |
| ChartController → Services | Abhängigkeit | Nutzt alle drei Services |
| RocketLaunch → LaunchStatus | Assoziation | Nutzt Enum als Attributtyp |
| MoonData → MoonPhase | Assoziation | Nutzt Enum als Attributtyp |

---

## 2. Relationales Datenmodell

### ER-Diagramm

```
┌─────────────────────────────────────────────────────────────────┐
│                      rocketmoon.db (SQLite)                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐
│       RocketLaunches        │
├─────────────────────────────┤
│ PK  Id          INTEGER     │
│     Name        TEXT        │  NOT NULL, MAX 200
│     LaunchDate  DATETIME    │  INDEX
│     Status      TEXT        │  (Enum als String)
│     Agency      TEXT        │  NOT NULL, MAX 100
│     RocketType  TEXT        │  MAX 100
│     ExternalId  TEXT        │  NULLABLE
└─────────────────────────────┘


┌─────────────────────────────┐
│         MoonPhases          │
├─────────────────────────────┤
│ PK  Id          INTEGER     │
│     Phase       TEXT        │  (Enum als String)
│     Date        DATETIME    │  INDEX
│     Year        INTEGER     │  INDEX
└─────────────────────────────┘
```

### Tabellenstruktur

#### Tabelle: RocketLaunches

| Spalte | Datentyp | Constraint | Beschreibung |
|--------|----------|------------|--------------|
| Id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Eindeutiger Primärschlüssel |
| Name | TEXT | NOT NULL, MAX 200 | Name der Mission/Rakete |
| LaunchDate | DATETIME | INDEX | Datum und Uhrzeit des Starts |
| Status | TEXT | - | Erfolg, Fehlschlag, Teilweise, TBD |
| Agency | TEXT | NOT NULL, MAX 100 | Raumfahrtorganisation (SpaceX, NASA, etc.) |
| RocketType | TEXT | MAX 100 | Raketentyp (Falcon 9, Starship, etc.) |
| ExternalId | TEXT | NULLABLE | Referenz-ID aus der Datenquelle |

#### Tabelle: MoonPhases

| Spalte | Datentyp | Constraint | Beschreibung |
|--------|----------|------------|--------------|
| Id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Eindeutiger Primärschlüssel |
| Phase | TEXT | - | Mondphase (NewMoon, FullMoon, etc.) |
| Date | DATETIME | INDEX | Datum der Mondphase |
| Year | INTEGER | INDEX | Jahr (für schnelle Jahresabfragen) |

### Kardinalitäten

```
┌───────────────────┐           ┌───────────────────┐
│  RocketLaunches   │           │    MoonPhases     │
│                   │           │                   │
│  Unabhängige      │           │  Unabhängige      │
│  Entität          │           │  Entität          │
│                   │           │                   │
│  Keine direkte    │           │  Keine direkte    │
│  FK-Beziehung     │           │  FK-Beziehung     │
└───────────────────┘           └───────────────────┘
         │                               │
         │                               │
         └───────────┬───────────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Logische        │
            │ Verknüpfung     │
            │ über Datum      │
            │ (±30 Tage)      │
            └─────────────────┘

Kardinalitäten:
- RocketLaunch : MoonPhase = n : 1 (logisch)
  (Jeder Start wird der nächsten Mondphase zugeordnet)
- Ein Jahr hat ca. 29 Mondphasen
- Ein Jahr hat ca. 100-500 Raketenstarts
```

### Indexe

| Tabelle | Index | Spalte(n) | Zweck |
|---------|-------|-----------|-------|
| RocketLaunches | IX_LaunchDate | LaunchDate | Schnelle Jahresabfragen |
| MoonPhases | IX_Date | Date | Schnelle Datumssuche |
| MoonPhases | IX_Year | Year | Schnelle Jahresfilterung |

---

## 3. Bewertung der Internetdatenquellen

### 3.1 Verwendete Datenquellen

| Nr. | Datenquelle | URL | Beschreibung |
|-----|-------------|-----|--------------|
| 1 | Launch Library 2 API | https://ll.thespacedevs.com/2.2.0/ | Raketenstartdaten weltweit |
| 2 | USNO Navy Moon API | https://aa.usno.navy.mil/api/moon/ | Mondphasendaten |
| 3 | Browser Window API | (System-API) | Browsersteuerung |

### 3.2 Datenqualitätskriterien

Die folgenden fünf Kriterien wurden zur Bewertung der Datenquellen herangezogen:

| Kriterium | Beschreibung |
|-----------|--------------|
| **Vollständigkeit** | Sind alle benötigten Datenfelder vorhanden? |
| **Aktualität** | Wie aktuell sind die bereitgestellten Daten? |
| **Genauigkeit** | Wie präzise und fehlerfrei sind die Daten? |
| **Verfügbarkeit** | Ist die API zuverlässig erreichbar? |
| **Konsistenz** | Sind die Daten einheitlich formatiert? |

### 3.3 Bewertung: Launch Library 2 API

**URL:** `https://ll.thespacedevs.com/2.2.0/launch/`

| Kriterium | Bewertung | Begründung |
|-----------|-----------|------------|
| Vollständigkeit | ★★★★★ (5/5) | Alle benötigten Felder vorhanden: Name, Datum, Status, Agentur, Raketentyp, externe ID |
| Aktualität | ★★★★★ (5/5) | Daten werden in Echtzeit aktualisiert, enthält Starts ab 1957 bis heute |
| Genauigkeit | ★★★★☆ (4/5) | Hohe Genauigkeit, gelegentlich TBD-Status bei zukünftigen Starts |
| Verfügbarkeit | ★★★★☆ (4/5) | API ist stabil erreichbar, Rate-Limit von ~100 Anfragen/Stunde |
| Konsistenz | ★★★★★ (5/5) | JSON-Format, einheitliche Struktur, gute Dokumentation |

**Gesamtbewertung:** 23/25 Punkte - **Sehr gut**

**Begründung der Auswahl:**
- Umfangreichste frei verfügbare Datenbank für Raketenstarts
- Enthält historische und aktuelle Daten (1957-heute)
- Paginierung ermöglicht effizientes Laden großer Datenmengen
- Keine Authentifizierung erforderlich

### 3.4 Bewertung: USNO Navy Moon API

**URL:** `https://aa.usno.navy.mil/api/moon/phases/year`

| Kriterium | Bewertung | Begründung |
|-----------|-----------|------------|
| Vollständigkeit | ★★★★★ (5/5) | Enthält alle vier Mondphasen pro Monat mit exaktem Datum |
| Aktualität | ★★★★★ (5/5) | Astronomische Berechnungen, Daten für viele Jahre verfügbar |
| Genauigkeit | ★★★★★ (5/5) | Wissenschaftliche Quelle (US Naval Observatory), höchste Präzision |
| Verfügbarkeit | ★★★★☆ (4/5) | Staatliche Institution, hohe Zuverlässigkeit, kein Rate-Limit dokumentiert |
| Konsistenz | ★★★★★ (5/5) | JSON-Format, klare Struktur, eindeutige Phasennamen |

**Gesamtbewertung:** 24/25 Punkte - **Ausgezeichnet**

**Begründung der Auswahl:**
- Offizielle wissenschaftliche Quelle der US-Regierung
- Höchste Genauigkeit durch astronomische Berechnungen
- Keine Authentifizierung erforderlich
- Einfache API mit klarer Struktur

### 3.5 Bewertung: Browser Window API

**Typ:** System-API (kein Internetzugriff)

| Kriterium | Bewertung | Begründung |
|-----------|-----------|------------|
| Vollständigkeit | ★★★★★ (5/5) | Bietet alle benötigten Funktionen (Port-Erkennung, URL-Öffnung) |
| Aktualität | ★★★★★ (5/5) | System-API, immer aktuell |
| Genauigkeit | ★★★★★ (5/5) | Direkte Systemaufrufe, keine Fehlerquelle |
| Verfügbarkeit | ★★★★★ (5/5) | Lokale API, immer verfügbar |
| Konsistenz | ★★★★★ (5/5) | Standardisierte Browser-APIs |

**Gesamtbewertung:** 25/25 Punkte - **Ausgezeichnet**

**Begründung der Auswahl:**
- Ermöglicht automatisches Öffnen der Anwendung im Browser
- Plattformübergreifende Unterstützung (Windows, Linux, macOS)
- Keine externe Abhängigkeit

### 3.6 Zusammenfassung der Datenquellenbewertung

| Datenquelle | Punkte | Bewertung |
|-------------|--------|-----------|
| Launch Library 2 API | 23/25 | Sehr gut |
| USNO Navy Moon API | 24/25 | Ausgezeichnet |
| Browser Window API | 25/25 | Ausgezeichnet |
| **Durchschnitt** | **24/25** | **Ausgezeichnet** |

### 3.7 Alternativ betrachtete Datenquellen

| Datenquelle | Grund für Nichtverwendung |
|-------------|--------------------------|
| SpaceX API | Nur SpaceX-Starts, nicht umfassend genug |
| NASA Open Data | Komplexere API-Struktur, weniger Startdaten |
| RocketLaunch.live | Kostenpflichtig für vollständigen Zugang |
| timeanddate.com | Keine offene API verfügbar |

---

## 4. Technische Übersicht

### Technologiestack

| Komponente | Technologie | Version |
|------------|-------------|---------|
| Backend | ASP.NET Core | 9.0 |
| Frontend | React + TypeScript | 19.2 / 5.9 |
| Datenbank | SQLite | 8.0 |
| ORM | Entity Framework Core | 8.0 |
| Diagramme | Recharts | 2.12 |

### Architektur

```
┌──────────────────────────────────────────────┐
│             Präsentationsschicht             │
│         (React + Recharts Frontend)          │
└──────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────┐
│               API-Schicht                    │
│         (ASP.NET Core Controller)            │
└──────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────┐
│             Geschäftslogik                   │
│    (RocketLaunchService, MoonDataService,    │
│          ChartAnalysisService)               │
└──────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────┐
│            Datenzugriffsschicht              │
│       (Entity Framework + AppDbContext)      │
└──────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────┐
│               Datenbank                      │
│          (SQLite - rocketmoon.db)            │
└──────────────────────────────────────────────┘
```

---

*Dokumentation erstellt am: Januar 2026*
*Projekt: RocketMoon (RoMo)*
