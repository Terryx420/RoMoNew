# RoMo - Rocket Launch & Moon Phase Analysis 🚀🌙

Eine Full-Stack-Webanwendung zur Analyse von Raketenstarts und deren Korrelation mit Mondphasen. Dieses Projekt visualisiert historische Raketenstartdaten und untersucht mögliche Zusammenhänge zwischen Starterfolgen und Mondphasen.

## 📋 Inhaltsverzeichnis

- [Features](#-features)
- [Technologie-Stack](#-technologie-stack)
- [Voraussetzungen](#-voraussetzungen)
- [Installation](#-installation)
- [Verwendung](#-verwendung)
- [Projektstruktur](#-projektstruktur)
- [API-Dokumentation](#-api-dokumentation)
- [Entwicklung](#-entwicklung)
- [Build & Deployment](#-build--deployment)
- [Architektur](#-architektur)
- [Lizenz](#-lizenz)

## ✨ Features

- **Datenanalyse**: Abrufen und Analysieren von Raketenstartdaten aus externen APIs
- **Mondphasen-Tracking**: Integration von Mondphasendaten für Korrelationsanalysen
- **Interaktive Visualisierung**: Drei verschiedene Chart-Typen:
  - 🌓 Mondphasen vs. Starterfolgsrate
  - 📊 Verteilung der Startstatus (Erfolg/Fehlschlag/Andere)
  - 📈 Zeitliche Übersicht der Starts
- **Jahresbasierte Filterung**: Daten von 1957 bis heute
- **Performance-Optimierung**: SQLite-basiertes Caching für schnelle Datenabfragen
- **Responsive UI**: Moderne React-Oberfläche mit TypeScript
- **Cross-Platform**: Läuft auf Windows, Linux und macOS

## 🛠 Technologie-Stack

### Backend
- **.NET 9.0** - ASP.NET Core Web API
- **Entity Framework Core 8.0** - ORM für Datenbankzugriff
- **SQLite** - Lokale Datenbank
- **C#** - Programmiersprache

### Frontend
- **React 19.2.0** - UI-Framework
- **TypeScript 5.9.3** - Typsicherheit
- **Vite 7.2.4** - Build-Tool und Dev-Server
- **Recharts 2.12.0** - Datenvisualisierung
- **ESLint** - Code-Qualität

### Architektur
- **Monorepo-Struktur** mit separaten Frontend- und Backend-Projekten
- **RESTful API** für Kommunikation zwischen Frontend und Backend
- **Single-File Executable** für einfache Deployment

## 📦 Voraussetzungen

Stellen Sie sicher, dass folgende Software installiert ist:

- **.NET 9.0 SDK** oder höher ([Download](https://dotnet.microsoft.com/download))
- **Node.js 18+** und npm ([Download](https://nodejs.org/))
- **Git** für Versionskontrolle

## 🚀 Installation

### 1. Repository klonen

```bash
git clone https://github.com/Terryx420/RoMoNew.git
cd RoMoNew
```

### 2. Backend-Setup

```bash
cd RoMo.Server
dotnet restore
```

Die SQLite-Datenbank wird beim ersten Start automatisch erstellt.

### 3. Frontend-Setup

```bash
cd ../romo.client
npm install
```

## 💻 Verwendung

### Entwicklungsmodus

Für die Entwicklung müssen beide Server gestartet werden:

#### Terminal 1: Backend starten

```bash
cd RoMo.Server
dotnet run
```

Backend läuft auf: `http://localhost:5181`

#### Terminal 2: Frontend starten

```bash
cd romo.client
npm run dev
```

Frontend läuft auf: `http://localhost:5173`

### Erste Schritte

1. Öffnen Sie `http://localhost:5173` im Browser
2. Wählen Sie ein Jahr aus dem Dropdown-Menü
3. Klicken Sie auf "Daten initialisieren" (dauert 10-30 Sekunden)
4. Erkunden Sie die verschiedenen Datenvisualisierungen

### Produktionsmodus

```bash
cd RoMo.Server
dotnet publish -c Release -r win-x64 --self-contained
```

Die selbstständige Executable finden Sie in `bin/Release/net9.0/win-x64/publish/`

## 📁 Projektstruktur

```
RoMoNew/
├── RoMo.Server/              # Backend (ASP.NET Core Web API)
│   ├── Controllers/          # API-Endpunkte
│   │   └── ChartController.cs
│   ├── Services/             # Business Logic
│   │   ├── RocketLaunchService.cs      # Raketenstartdaten
│   │   ├── MoonDataService.cs          # Mondphasendaten
│   │   └── ChartAnalysisService.cs     # Datenanalyse
│   ├── Models/               # Domain-Modelle
│   │   ├── RocketLaunch.cs
│   │   ├── MoonData.cs
│   │   ├── ChartCache.cs
│   │   └── Enums.cs
│   ├── DTOs/                 # Data Transfer Objects
│   │   ├── ChartDTOs.cs
│   │   ├── ChartDataDTO.cs
│   │   └── ApiResponseModels.cs
│   ├── Data/                 # Datenbank-Konfiguration
│   │   └── AppDbContext.cs
│   ├── Program.cs            # Einstiegspunkt
│   ├── appsettings.json      # Konfiguration
│   └── RoMo.Server.csproj    # Projekt-Datei
│
├── romo.client/              # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/       # React-Komponenten
│   │   │   ├── LaunchStatusChart.tsx
│   │   │   ├── LaunchTimelineChart.tsx
│   │   │   ├── MoonPhaseSuccessChart.tsx
│   │   │   ├── ChartTooltip.tsx
│   │   │   └── ChartState.tsx
│   │   ├── services/         # API-Kommunikation
│   │   │   └── chartApi.ts
│   │   ├── types/            # TypeScript-Typen
│   │   │   └── chart.types.ts
│   │   ├── styles.ts         # Zentrale Styles
│   │   ├── App.tsx           # Haupt-Komponente
│   │   └── main.tsx          # Entry Point
│   ├── public/               # Statische Assets
│   ├── vite.config.ts        # Vite-Konfiguration
│   ├── tsconfig.json         # TypeScript-Config
│   ├── package.json          # Dependencies
│   └── index.html            # HTML Entry Point
│
└── RoMo.sln                  # Visual Studio Solution
```

## 🔌 API-Dokumentation

### Base URL
- **Development**: `http://localhost:5181/api/chart`
- **Production**: Abhängig vom Deployment

### Endpunkte

#### GET `/api/chart/available-years`
Gibt alle verfügbaren Jahre für die Datenanalyse zurück.

**Response:**
```json
{
  "years": [1957, 1958, ..., 2025]
}
```

#### POST `/api/chart/initialize`
Initialisiert und cached Daten für ein bestimmtes Jahr.

**Request Body:**
```json
{
  "year": 2024
}
```

**Response:**
```json
{
  "success": true,
  "message": "Daten für Jahr 2024 erfolgreich initialisiert"
}
```

**Hinweis**: Dieser Vorgang kann 10-30 Sekunden dauern.

#### GET `/api/chart/moon-phase-success`
Gibt die Korrelation zwischen Mondphasen und Starterfolgen zurück.

#### GET `/api/chart/launch-status`
Gibt die Verteilung der Startstatus zurück.

#### GET `/api/chart/launch-timeline`
Gibt die zeitliche Übersicht der Starts zurück.

## 🔧 Entwicklung

### Backend-Entwicklung

```bash
cd RoMo.Server
dotnet watch run
```

Hot-Reload ist aktiviert - Änderungen werden automatisch übernommen.

### Frontend-Entwicklung

```bash
cd romo.client
npm run dev
```

Vite bietet Hot Module Replacement (HMR) für schnelle Entwicklung.

### Linting

```bash
cd romo.client
npm run lint
```

### Datenbank-Migrationen

Die Datenbank wird automatisch beim ersten Start erstellt. Bei Modelländerungen:

```bash
cd RoMo.Server
dotnet ef migrations add MigrationName
dotnet ef database update
```

### Code-Style

- **Backend**: Folgt C# Coding Conventions
- **Frontend**: ESLint-Konfiguration in `eslint.config.js`
- **TypeScript**: Strikte Type-Checks aktiviert

## 📦 Build & Deployment

### Frontend Build

```bash
cd romo.client
npm run build
```

Output: `../RoMo.Server/wwwroot/`

### Backend Build (mit Frontend)

```bash
cd RoMo.Server
dotnet publish -c Release
```

### Self-Contained Executable (Windows)

```bash
dotnet publish -c Release -r win-x64 --self-contained
```

### Self-Contained Executable (Linux)

```bash
dotnet publish -c Release -r linux-x64 --self-contained
```

### Self-Contained Executable (macOS)

```bash
dotnet publish -c Release -r osx-x64 --self-contained
```

**Hinweis**: Das Frontend wird automatisch vor dem Release-Build kompiliert (siehe `RoMo.Server.csproj`).

## 🏗 Architektur

### Backend-Architektur

```
┌─────────────┐
│  Controllers │ ← HTTP Requests
└──────┬──────┘
       │
┌──────▼──────┐
│   Services  │ ← Business Logic
└──────┬──────┘
       │
┌──────▼──────┐
│   DbContext │ ← Data Access
└──────┬──────┘
       │
┌──────▼──────┐
│   SQLite    │ ← Persistence
└─────────────┘
```

### Datenfluss

1. **User Action** → Frontend sendet HTTP Request
2. **Controller** → Empfängt Request und validiert Input
3. **Service Layer** → Business Logic, externe API Calls
4. **Data Layer** → Speichert/Abruft Daten aus SQLite
5. **Cache Layer** → Optimiert Performance durch Chart-Caching
6. **Response** → DTO zurück zum Frontend

### Caching-Strategie

- Chart-Daten werden nach Jahr + ChartType gecacht
- Reduziert externe API-Calls
- Verbessert Response-Zeiten erheblich

## 🧪 Testing

### Backend Tests

```bash
cd RoMo.Server
dotnet test
```

*(Tests müssen noch implementiert werden)*

### Frontend Tests

```bash
cd romo.client
npm run test
```

*(Tests müssen noch implementiert werden)*

## 🤝 Contributing

Da dies ein Schulprojekt ist, sind externe Contributions derzeit nicht vorgesehen.

### Entwickler

- Projektteam Schulprojekt 2025

## 📝 Lizenz

Dieses Projekt ist ein Schulprojekt und derzeit nicht unter einer Open-Source-Lizenz veröffentlicht.

## 🙏 Acknowledgments

- Raketenstartdaten von externen APIs
- Mondphasendaten von öffentlichen Quellen
- React und .NET Communities für hervorragende Dokumentation

---

**Hinweis**: Dies ist ein Schulprojekt (2025) zur Demonstration von Full-Stack-Entwicklung mit modernen Web-Technologien.

## 📞 Support

Bei Fragen oder Problemen:
1. Überprüfen Sie die [API-Dokumentation](#-api-dokumentation)
2. Stellen Sie sicher, dass alle [Voraussetzungen](#-voraussetzungen) erfüllt sind
3. Prüfen Sie die Browser-Konsole auf Fehlermeldungen

---

*Erstellt mit .NET 9.0 und React 19.2.0*
