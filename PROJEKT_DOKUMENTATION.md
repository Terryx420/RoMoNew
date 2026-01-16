# RoMoNew - Umfassende Code-Dokumentation

## Inhaltsverzeichnis
1. [Projektübersicht](#1-projektübersicht)
2. [SQLite - Was ist das und warum?](#2-sqlite---was-ist-das-und-warum)
3. [Entity Framework vs. Plain SQLite](#3-entity-framework-vs-plain-sqlite)
4. [Async/Await - Asynchrone Programmierung](#4-asyncawait---asynchrone-programmierung)
5. [Generische Typen (T)](#5-generische-typen-t)
6. [REST-Schnittstelle (Frontend-Backend)](#6-rest-schnittstelle-frontend-backend-verbindung)
7. [Web-Framework in Desktop-Anwendung](#7-web-framework-in-desktop-anwendung)
8. [Alternative Technologien](#8-alternative-technologien-die-wir-hätten-nutzen-können)
9. [Detaillierte Klassen-Erklärungen](#9-detaillierte-klassen-erklärungen)

---

## 1. Projektübersicht

### Was macht die Anwendung?
Die Anwendung analysiert den Zusammenhang zwischen **Mondphasen** und **Raketenstarts**. Sie sammelt Daten aus dem Internet (Launch Library 2 API + US Navy Moon API), speichert diese lokal und visualisiert sie in drei verschiedenen Diagrammtypen.

### Architektur-Überblick
```
┌─────────────────────────────────────────────────────────────┐
│                    Desktop-Anwendung (.exe)                  │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript)                              │
│  ├── App.tsx          → Hauptkomponente, State-Management   │
│  ├── Chart-Komponenten → Recharts-Visualisierungen          │
│  └── chartApi.ts      → HTTP-Client für Backend             │
├─────────────────────────────────────────────────────────────┤
│  Backend (ASP.NET Core + C#)                                │
│  ├── ChartController  → REST-Endpunkte                      │
│  ├── Services         → Geschäftslogik + Datenverarbeitung  │
│  └── AppDbContext     → Entity Framework Core               │
├─────────────────────────────────────────────────────────────┤
│  Datenbank (SQLite)                                         │
│  └── rocketmoon.db    → Lokale Datei                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. SQLite - Was ist das und warum?

### Was ist SQLite?
SQLite ist eine **serverlose, relationale Datenbank**, die komplett in einer einzigen Datei gespeichert wird (bei uns: `rocketmoon.db`).

### Vergleich mit anderen Datenbanken

| Merkmal | SQLite | MySQL/PostgreSQL | MS SQL Server |
|---------|--------|------------------|---------------|
| Server nötig? | **Nein** | Ja | Ja |
| Installation | Keine | Kompliziert | Sehr kompliziert |
| Dateibasiert | Ja (1 Datei) | Nein | Nein |
| Portable | **Sehr gut** | Schlecht | Schlecht |
| Performance | Gut für kleine-mittlere Daten | Besser für große Daten | Besser für große Daten |
| Kosten | Kostenlos | Kostenlos/Kostenpflichtig | Teuer |

### Warum SQLite für unser Projekt?

1. **Anforderung "ohne zusätzliche Installationen"**: SQLite braucht keinen Server - perfekt für Schulrechner!
2. **Portable**: Die `.exe` + `.db` Datei kann einfach kopiert werden
3. **Ausreichende Performance**: Für unsere Datenmenge (ca. 1000-2000 Einträge pro Jahr) mehr als genug
4. **Einfaches Deployment**: Keine Konfiguration nötig

### Code-Beispiel: SQLite-Verbindung

```csharp
// In Program.cs - So einfach ist die Verbindung:
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=rocketmoon.db"));
```

Die Datenbank wird automatisch erstellt, wenn sie nicht existiert:
```csharp
db.Database.EnsureCreated();  // Erstellt DB + alle Tabellen
```

---

## 3. Entity Framework vs. Plain SQLite

### Was ist Entity Framework (EF)?

Entity Framework ist ein **ORM** (Object-Relational Mapper). Es übersetzt automatisch zwischen:
- **C#-Objekten** (unsere Klassen wie `RocketLaunch`)
- **Datenbank-Tabellen** (SQL)

### Der große Unterschied: Code-Vergleich

#### OHNE Entity Framework (Plain SQLite):
```csharp
// Man muss SQL manuell schreiben und alle Felder einzeln mappen
using var connection = new SqliteConnection("Data Source=rocketmoon.db");
connection.Open();

var command = connection.CreateCommand();
command.CommandText = @"
    SELECT Id, Name, LaunchDate, Status, Agency, RocketType
    FROM RocketLaunches
    WHERE strftime('%Y', LaunchDate) = @year";
command.Parameters.AddWithValue("@year", year.ToString());

var launches = new List<RocketLaunch>();
using var reader = command.ExecuteReader();
while (reader.Read())
{
    launches.Add(new RocketLaunch
    {
        Id = reader.GetInt32(0),
        Name = reader.GetString(1),
        LaunchDate = reader.GetDateTime(2),
        Status = Enum.Parse<LaunchStatus>(reader.GetString(3)),
        Agency = reader.GetString(4),
        RocketType = reader.IsDBNull(5) ? null : reader.GetString(5)
    });
}
```

#### MIT Entity Framework (unser Code):
```csharp
// Eine Zeile statt 20 - EF macht alles automatisch!
var launches = _context.RocketLaunches
    .Where(l => l.LaunchDate.Year == year)
    .ToList();
```

### Vorteile von Entity Framework

| Vorteil | Erklärung |
|---------|-----------|
| **Weniger Code** | EF generiert SQL automatisch |
| **Typsicherheit** | Kompiler-Fehler statt Runtime-Fehler |
| **IntelliSense** | Autovervollständigung für Eigenschaften |
| **Keine SQL-Injection** | Parameter werden automatisch escaped |
| **Migrations** | Datenbankschema-Änderungen werden verwaltet |
| **Lazy/Eager Loading** | Flexible Datenladung |

### Nachteile von Entity Framework

| Nachteil | Erklärung |
|----------|-----------|
| **Overhead** | Mehr Speicherverbrauch, langsamer bei Massenoperationen |
| **Lernkurve** | Man muss verstehen, wie EF funktioniert |
| **Verstecktes SQL** | Schwerer zu debuggen, was tatsächlich passiert |
| **N+1 Problem** | Bei falschem Laden werden viele Queries ausgeführt |

### Wann würde man Plain SQLite bevorzugen?

- Bei extrem performance-kritischen Anwendungen
- Wenn man volle Kontrolle über das SQL braucht
- Bei sehr einfachen Datenstrukturen (1-2 Tabellen)

### Unser DbContext erklärt

```csharp
// Datei: RoMo.Server/Data/AppDbContext.cs

public class AppDbContext : DbContext
{
    // Konstruktor: Bekommt die Konfiguration von der Dependency Injection
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // DbSet = Eine Tabelle in der Datenbank
    // "Set<T>()" ist eine EF-Methode die die Tabelle zurückgibt
    public DbSet<RocketLaunch> RocketLaunches => Set<RocketLaunch>();
    public DbSet<MoonData> MoonPhases => Set<MoonData>();
    public DbSet<ChartCache> ChartCache => Set<ChartCache>();

    // Hier konfigurieren wir das Datenbankschema
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // RocketLaunch Tabelle konfigurieren
        modelBuilder.Entity<RocketLaunch>(entity =>
        {
            entity.HasKey(e => e.Id);                    // Primärschlüssel
            entity.Property(e => e.Name)
                .IsRequired()                             // NOT NULL
                .HasMaxLength(200);                       // VARCHAR(200)

            // Enum als String speichern (lesbar in DB)
            entity.Property(e => e.Status)
                .HasConversion<string>();

            // Index für schnellere Abfragen
            entity.HasIndex(e => e.LaunchDate);
        });

        // Ähnlich für andere Tabellen...
    }
}
```

### LINQ-Abfragen erklärt

```csharp
// Beispiel aus ChartAnalysisService.cs - Was passiert hier genau?

var launches = _context.RocketLaunches
    .Where(l => l.LaunchDate.Year == year)    // SQL: WHERE YEAR(LaunchDate) = @year
    .OrderBy(l => l.LaunchDate)                // SQL: ORDER BY LaunchDate
    .ToList();                                  // Führt die Query aus und gibt Liste zurück

// Das generierte SQL sieht ungefähr so aus:
// SELECT * FROM RocketLaunches
// WHERE strftime('%Y', LaunchDate) = '2025'
// ORDER BY LaunchDate
```

---

## 4. Async/Await - Asynchrone Programmierung

### Was ist das Problem ohne Async?

Ohne asynchrone Programmierung würde unsere Anwendung **blockieren**, während sie auf Daten wartet:

```
SYNCHRON (blockiert):
┌────────────────────────────────────────────────────────────┐
│ User klickt "Laden"                                         │
│    ↓                                                        │
│ HTTP-Request an API (3 Sekunden warten...)                  │
│    ↓                                                        │
│ ❌ UI FRIERT EIN - Benutzer kann nichts machen!            │
│    ↓                                                        │
│ Antwort kommt, UI reagiert wieder                           │
└────────────────────────────────────────────────────────────┘

ASYNCHRON (nicht-blockierend):
┌────────────────────────────────────────────────────────────┐
│ User klickt "Laden"                                         │
│    ↓                                                        │
│ HTTP-Request startet (im Hintergrund)                       │
│    ↓                                                        │
│ ✅ UI bleibt responsive - User sieht Ladeanimation         │
│    ↓                                                        │
│ Antwort kommt, Daten werden angezeigt                       │
└────────────────────────────────────────────────────────────┘
```

### Wie funktioniert async/await?

```csharp
// Datei: RoMo.Server/Services/RocketLaunchService.cs

// "async" markiert die Methode als asynchron
// "Task<T>" ist der Rückgabetyp - wie ein "Versprechen" auf das Ergebnis
public async Task<List<RocketLaunch>> FetchAndSaveLaunchesAsync(int year)
{
    // Prüfen ob Daten schon in DB sind
    var existingLaunches = _context.RocketLaunches
        .Where(l => l.LaunchDate.Year == year)
        .ToList();

    if (existingLaunches.Any())
        return existingLaunches;  // Sofort zurück, kein async nötig

    var allLaunches = new List<RocketLaunch>();
    int offset = 0;

    while (true)
    {
        // "await" pausiert hier und gibt die Kontrolle zurück
        // Sobald der HTTP-Response da ist, geht es weiter
        string response = await _httpClient.GetStringAsync(url);

        // JSON parsen
        var data = JsonSerializer.Deserialize<LaunchLibraryResponse>(response);

        // ... Verarbeitung ...

        if (string.IsNullOrEmpty(data.Next))
            break;

        offset += 100;
    }

    // Auch Datenbankoperationen sind async!
    await _context.RocketLaunches.AddRangeAsync(allLaunches);
    await _context.SaveChangesAsync();

    return allLaunches;
}
```

### Was passiert bei await genau?

```csharp
// OHNE await:
string response = _httpClient.GetStringAsync(url).Result;  // ❌ BLOCKIERT!

// MIT await:
string response = await _httpClient.GetStringAsync(url);   // ✅ Nicht-blockierend
```

Bei `await`:
1. Die Methode **pausiert** an dieser Stelle
2. Der **Thread wird freigegeben** (kann andere Aufgaben machen)
3. Wenn das Ergebnis da ist, **geht es weiter**

### Async im Frontend (TypeScript/React)

```typescript
// Datei: romo.client/src/services/chartApi.ts

// Auch in TypeScript gibt es async/await - funktioniert genauso!
export async function getAvailableYears(): Promise<number[]> {
    // fetch() ist von Natur aus async
    const response = await fetch(`${API_BASE_URL}/chart/available-years`);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // .json() ist auch async
    return await response.json();
}
```

```typescript
// Datei: romo.client/src/App.tsx

// In React verwendet man useEffect für async Operationen
useEffect(() => {
    // Async-Funktion definieren (useEffect kann nicht direkt async sein)
    const loadYears = async () => {
        try {
            setIsLoadingYears(true);
            const years = await chartApi.getAvailableYears();
            setAvailableYears(years);
        } catch (err) {
            setError('Fehler beim Laden der Jahre');
        } finally {
            setIsLoadingYears(false);
        }
    };

    loadYears();  // Funktion aufrufen
}, []);  // Leeres Array = nur beim ersten Laden ausführen
```

### Wichtige Async-Regeln

1. **Async "infiziert" nach oben**: Wenn eine Methode async ist, sollte der Aufrufer auch async sein
2. **Niemals `.Result` oder `.Wait()` nutzen**: Das blockiert und kann zu Deadlocks führen
3. **Task vs Task<T>**: `Task` = kein Rückgabewert, `Task<T>` = Rückgabewert vom Typ T
4. **Fehlerbehandlung**: `try/catch` funktioniert normal um `await`

---

## 5. Generische Typen (T)

### Was sind Generics?

Generics erlauben es, **wiederverwendbaren Code** zu schreiben, der mit **verschiedenen Datentypen** funktioniert.

### Beispiel ohne Generics (das Problem)

```csharp
// Ohne Generics müssten wir für jeden Chart-Typ eine eigene Cache-Methode schreiben:

public async Task<MoonPhaseSuccessChartDTO?> GetMoonPhaseFromCacheAsync(int year)
{
    var cache = await _context.ChartCache
        .FirstOrDefaultAsync(c => c.Year == year && c.ChartType == "moon-phase");

    if (cache == null) return null;
    return JsonSerializer.Deserialize<MoonPhaseSuccessChartDTO>(cache.JsonData);
}

public async Task<LaunchStatusChartDTO?> GetLaunchStatusFromCacheAsync(int year)
{
    var cache = await _context.ChartCache
        .FirstOrDefaultAsync(c => c.Year == year && c.ChartType == "launch-status");

    if (cache == null) return null;
    return JsonSerializer.Deserialize<LaunchStatusChartDTO>(cache.JsonData);
}

// Das ist viel Duplikation! 😫
```

### Mit Generics (unsere Lösung)

```csharp
// Datei: RoMo.Server/Services/ChartAnalysisService.cs

// Eine Methode für ALLE Typen!
// "T" ist ein Platzhalter für einen beliebigen Typ
// "where T : class" bedeutet: T muss eine Klasse sein (kein int, bool, etc.)
private async Task<T?> GetFromCacheAsync<T>(int year, string chartType) where T : class
{
    var cache = await _context.ChartCache
        .FirstOrDefaultAsync(c => c.Year == year && c.ChartType == chartType);

    if (cache == null)
        return null;

    // T wird hier zur Laufzeit durch den konkreten Typ ersetzt
    return JsonSerializer.Deserialize<T>(cache.JsonData);
}

// Genauso für das Speichern:
private async Task SaveToCacheAsync<T>(int year, string chartType, T data)
{
    var existing = await _context.ChartCache
        .FirstOrDefaultAsync(c => c.Year == year && c.ChartType == chartType);

    string jsonData = JsonSerializer.Serialize(data);

    if (existing != null)
    {
        existing.JsonData = jsonData;
        existing.CreatedAt = DateTime.UtcNow;
    }
    else
    {
        await _context.ChartCache.AddAsync(new ChartCache
        {
            Year = year,
            ChartType = chartType,
            JsonData = jsonData,
            CreatedAt = DateTime.UtcNow
        });
    }

    await _context.SaveChangesAsync();
}
```

### Verwendung der generischen Methoden

```csharp
// Die generischen Methoden werden so aufgerufen:

// Für MoonPhase-Chart:
var cachedData = await GetFromCacheAsync<MoonPhaseSuccessChartDTO>(year, "moon-phase-success");
await SaveToCacheAsync(year, "moon-phase-success", result);

// Für LaunchStatus-Chart:
var cachedData = await GetFromCacheAsync<LaunchStatusChartDTO>(year, "launch-status");
await SaveToCacheAsync(year, "launch-status", result);

// Für Timeline-Chart:
var cachedData = await GetFromCacheAsync<LaunchTimelineChartDTO>(year, "launch-timeline");
await SaveToCacheAsync(year, "launch-timeline", result);

// Der Compiler ersetzt T automatisch durch den richtigen Typ!
```

### Warum macht das Sinn?

1. **DRY-Prinzip** (Don't Repeat Yourself): Eine Methode statt drei
2. **Typsicherheit**: Der Compiler prüft, dass die Typen zusammenpassen
3. **Wartbarkeit**: Änderungen nur an einer Stelle
4. **Erweiterbarkeit**: Neue Chart-Typen brauchen keine neuen Cache-Methoden

### Generics im Frontend

```typescript
// Datei: romo.client/src/services/chartApi.ts

// Auch TypeScript hat Generics!
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('API Call:', url);

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // T wird hier durch den erwarteten Rückgabetyp ersetzt
    return response.json() as Promise<T>;
}

// Verwendung:
export const chartApi = {
    getAvailableYears: () => apiCall<number[]>('/chart/available-years'),
    getMoonPhaseSuccess: (year: number) =>
        apiCall<MoonPhaseSuccessChartDTO>(`/chart/moon-phase-success?year=${year}`),
    getLaunchStatus: (year: number) =>
        apiCall<LaunchStatusChartDTO>(`/chart/launch-status?year=${year}`),
};
```

### Generics-Einschränkungen (Constraints)

```csharp
// "where T : class" ist eine Einschränkung
// Andere mögliche Einschränkungen:

where T : class          // T muss Referenztyp sein
where T : struct         // T muss Werttyp sein
where T : new()          // T muss parameterlosen Konstruktor haben
where T : BaseClass      // T muss von BaseClass erben
where T : IInterface     // T muss Interface implementieren
```

---

## 6. REST-Schnittstelle (Frontend-Backend Verbindung)

### Was ist REST?

REST (Representational State Transfer) ist ein **Architekturstil** für Web-APIs. Die wichtigsten Prinzipien:

1. **Ressourcen** werden über URLs identifiziert
2. **HTTP-Methoden** beschreiben die Aktion (GET, POST, PUT, DELETE)
3. **Zustandslos**: Jede Anfrage enthält alle nötigen Informationen

### Unsere REST-Endpunkte

```
┌─────────────────────────────────────────────────────────────────┐
│                    ChartController                               │
│                    Route: /api/chart                             │
├─────────────────────────────────────────────────────────────────┤
│ GET  /available-years        → Liste aller verfügbaren Jahre    │
│ POST /init/{year}            → Daten für Jahr laden             │
│ GET  /moon-phase-success     → Mondphasen-Erfolgsraten          │
│ GET  /launch-status          → Start-Status Verteilung          │
│ GET  /launch-timeline        → Monatliche Start-Timeline        │
└─────────────────────────────────────────────────────────────────┘
```

### Backend: Controller erklärt

```csharp
// Datei: RoMo.Server/Controllers/ChartController.cs

[ApiController]                    // Markiert als API-Controller
[Route("api/[controller]")]        // Route = /api/chart (controller-Name ohne "Controller")
public class ChartController : ControllerBase
{
    // Dependencies werden über Konstruktor injiziert
    private readonly RocketLaunchService _launchService;
    private readonly MoonDataService _moonService;
    private readonly ChartAnalysisService _chartService;

    public ChartController(
        RocketLaunchService launchService,
        MoonDataService moonService,
        ChartAnalysisService chartService)
    {
        _launchService = launchService;
        _moonService = moonService;
        _chartService = chartService;
    }

    // GET /api/chart/available-years
    [HttpGet("available-years")]
    public async Task<ActionResult<List<int>>> GetAvailableYears()
    {
        try
        {
            var years = await _launchService.GetAvailableYearsAsync();
            return Ok(years);  // HTTP 200 mit JSON-Array
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Fehler: {ex.Message}");  // HTTP 500
        }
    }

    // POST /api/chart/init/2025
    [HttpPost("init/{year}")]
    public async Task<ActionResult> InitializeData(int year)
    {
        try
        {
            // Erst Mondphasen laden
            var moonPhases = await _moonService.FetchAndSaveMoonPhasesAsync(year);

            // Dann Raketenstarts laden
            var launches = await _launchService.FetchAndSaveLaunchesAsync(year);

            // Antwort mit Statistiken
            return Ok(new
            {
                year,
                moonPhasesCount = moonPhases.Count,
                launchesCount = launches.Count,
                message = $"Daten für {year} erfolgreich geladen"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Fehler: {ex.Message}");
        }
    }

    // GET /api/chart/moon-phase-success?year=2025
    [HttpGet("moon-phase-success")]
    public async Task<ActionResult<MoonPhaseSuccessChartDTO>> GetMoonPhaseSuccess(
        [FromQuery] int year)  // Parameter aus URL-Query
    {
        try
        {
            var result = await _chartService.GetSuccessRateByMoonPhaseAsync(year);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Fehler: {ex.Message}");
        }
    }

    // ... weitere Endpunkte ähnlich
}
```

### Frontend: API-Client erklärt

```typescript
// Datei: romo.client/src/services/chartApi.ts

// Erkennung: Development vs Production
const isDevelopment = window.location.port === '5173';

// Development: Frontend läuft auf Port 5173, Backend auf 5181
// Production: Beides auf gleichem Server
const API_BASE_URL = isDevelopment
    ? 'http://localhost:5181/api'
    : '/api';

// Generischer API-Wrapper
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<T>;
}

// Exportierte API-Methoden
export const chartApi = {
    getAvailableYears: () =>
        apiCall<number[]>('/chart/available-years'),

    initializeData: (year: number) =>
        apiCall<InitResponse>(`/chart/init/${year}`, { method: 'POST' }),

    getMoonPhaseSuccess: (year: number) =>
        apiCall<MoonPhaseSuccessChartDTO>(`/chart/moon-phase-success?year=${year}`),

    getLaunchStatus: (year: number) =>
        apiCall<LaunchStatusChartDTO>(`/chart/launch-status?year=${year}`),

    getLaunchTimeline: (year: number) =>
        apiCall<LaunchTimelineChartDTO>(`/chart/launch-timeline?year=${year}`),
};
```

### HTTP Request/Response Zyklus

```
Frontend                         Backend                          Datenbank
   │                                │                                │
   │  GET /api/chart/moon-phase?year=2025                           │
   │ ─────────────────────────────► │                                │
   │                                │                                │
   │                                │  SELECT * FROM ChartCache      │
   │                                │  WHERE Year=2025               │
   │                                │ ─────────────────────────────► │
   │                                │                                │
   │                                │  ◄──── Cache-Ergebnis          │
   │                                │                                │
   │  ◄───── HTTP 200 + JSON       │                                │
   │  { "data": [...] }            │                                │
   │                                │                                │
```

### JSON-Datenformat (Beispiel)

```json
// Anfrage: GET /api/chart/moon-phase-success?year=2025
// Antwort:
{
    "data": [
        {
            "moonPhase": "NewMoon",
            "totalLaunches": 42,
            "successfulLaunches": 38,
            "successRate": 90.48
        },
        {
            "moonPhase": "FullMoon",
            "totalLaunches": 35,
            "successfulLaunches": 30,
            "successRate": 85.71
        }
        // ...
    ]
}
```

### CORS (Cross-Origin Resource Sharing)

In der Entwicklung laufen Frontend und Backend auf verschiedenen Ports. Browser blockieren normalerweise solche "Cross-Origin" Anfragen aus Sicherheitsgründen.

```csharp
// Datei: Program.cs

// CORS-Policy definieren
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()     // Erlaubt alle Domains
              .AllowAnyMethod()      // GET, POST, PUT, DELETE, etc.
              .AllowAnyHeader();     // Alle HTTP-Header
    });
});

// CORS aktivieren
app.UseCors("AllowAll");
```

---

## 7. Web-Framework in Desktop-Anwendung

### Das Konzept: Hybrid-Anwendung

Unsere Anwendung ist eine **Hybrid-Anwendung**: Ein Desktop-Programm (.exe), das intern einen Webserver betreibt und die UI im Browser anzeigt.

```
┌──────────────────────────────────────────────────────────────┐
│                     RoMo.Server.exe                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ASP.NET Core Webserver                                │ │
│  │  ├── Hostet REST-API auf localhost:5000                │ │
│  │  └── Liefert Frontend-Dateien aus wwwroot/             │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│                              ▼                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Automatischer Browser-Start                           │ │
│  │  → Öffnet http://localhost:5000                        │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│  Standard-Browser (Chrome, Firefox, Edge...)                 │
│  ├── Zeigt React-Frontend an                                 │
│  └── Kommuniziert mit Backend über REST                      │
└──────────────────────────────────────────────────────────────┘
```

### Wie das Deployment funktioniert

```csharp
// Datei: RoMo.Server.csproj

<PropertyGroup>
    <!-- Single-File: Alles in einer .exe -->
    <PublishSingleFile>true</PublishSingleFile>

    <!-- Self-Contained: .NET Runtime ist eingebettet -->
    <SelfContained>true</SelfContained>

    <!-- Native Libraries einbetten (für SQLite) -->
    <IncludeNativeLibrariesForSelfExtract>true</IncludeNativeLibrariesForSelfExtract>
</PropertyGroup>

<!-- Frontend wird vor dem Build kompiliert -->
<Target Name="BuildFrontend" BeforeTargets="Build">
    <Exec WorkingDirectory="$(SpaRoot)" Command="npm install" />
    <Exec WorkingDirectory="$(SpaRoot)" Command="npm run build" />
</Target>
```

### Browser automatisch starten

```csharp
// Datei: Program.cs

// In Production: Browser automatisch öffnen
if (!app.Environment.IsDevelopment())
{
    // Statische Frontend-Dateien bereitstellen
    app.UseDefaultFiles();
    app.UseStaticFiles();

    // Browser nach 1.5 Sekunden öffnen (Zeit für Server-Start)
    _ = Task.Run(async () =>
    {
        await Task.Delay(1500);
        string url = "http://localhost:5000";

        try
        {
            // Cross-Platform Browser-Öffnung
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
                Process.Start("xdg-open", url);
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
                Process.Start("open", url);
        }
        catch { /* Browser konnte nicht geöffnet werden */ }
    });
}
```

### Vorteile dieser Architektur

| Vorteil | Erklärung |
|---------|-----------|
| **Moderne UI** | React ermöglicht schöne, responsive Oberflächen |
| **Einfaches Deployment** | Eine .exe Datei, die alles enthält |
| **Keine Installation** | Kein Browser-Plugin, kein Framework nötig |
| **Cross-Platform** | Funktioniert auf Windows, Linux, macOS |
| **Bekannte Technologien** | Web-Entwicklung ist weit verbreitet |

### Nachteile dieser Architektur

| Nachteil | Erklärung |
|----------|-----------|
| **Browser nötig** | Benutzer braucht einen Browser |
| **Kein natives "Look & Feel"** | Sieht nicht aus wie native Windows-App |
| **Port-Konflikte möglich** | Port 5000 könnte belegt sein |
| **Größere .exe** | Enthält .NET Runtime (~70MB) |

---

## 8. Alternative Technologien (die wir hätten nutzen können)

### Desktop-UI Frameworks für C#

#### 1. WPF (Windows Presentation Foundation)
```
✅ Vorteile:
   - Native Windows-Look
   - Sehr mächtig für komplexe UIs
   - MVVM-Pattern gut unterstützt
   - Data Binding eingebaut

❌ Nachteile:
   - Nur Windows (nicht cross-platform)
   - Steile Lernkurve
   - XAML ist komplex
   - Charts brauchen externe Libraries
```

#### 2. Windows Forms (WinForms)
```
✅ Vorteile:
   - Einfach zu lernen
   - Drag & Drop Designer
   - Schnelle Entwicklung

❌ Nachteile:
   - Veraltetes Design
   - Nur Windows
   - Begrenzte Anpassbarkeit
   - Charts kompliziert
```

#### 3. MAUI (.NET Multi-platform App UI)
```
✅ Vorteile:
   - Cross-Platform (Windows, macOS, iOS, Android)
   - Modern (Nachfolger von Xamarin)
   - Microsoft-Support

❌ Nachteile:
   - Relativ neu, weniger Dokumentation
   - Komplexer als Web
   - Performance-Variationen zwischen Plattformen
```

#### 4. Avalonia UI
```
✅ Vorteile:
   - Cross-Platform (inkl. Linux)
   - Ähnlich zu WPF
   - Aktive Community

❌ Nachteile:
   - Kleinere Community als WPF
   - Weniger Libraries
   - Lernkurve
```

#### 5. Electron mit C# Backend
```
✅ Vorteile:
   - Volle Web-Technologien
   - Cross-Platform
   - Große Ecosystem

❌ Nachteile:
   - Sehr großes Executable (~100MB+)
   - Hoher RAM-Verbrauch
   - Zwei separate Projekte (Electron + C#)
```

### Vergleichstabelle

| Kriterium | Unsere Lösung | WPF | WinForms | MAUI | Avalonia |
|-----------|---------------|-----|----------|------|----------|
| Cross-Platform | ✅ | ❌ | ❌ | ✅ | ✅ |
| Lernkurve | Mittel | Hoch | Niedrig | Mittel | Hoch |
| Moderne UI | ✅ | ✅ | ❌ | ✅ | ✅ |
| Charts einfach | ✅ | ❌ | ❌ | ❌ | ❌ |
| Deployment | ✅ | ✅ | ✅ | Mittel | ✅ |
| Browser nötig | ✅ | ❌ | ❌ | ❌ | ❌ |

### Warum wir uns für Web entschieden haben

1. **Recharts**: Sehr einfache Chart-Bibliothek mit schönen Visualisierungen
2. **React-Erfahrung**: Team hatte bereits Web-Erfahrung
3. **Modernes Design**: Einfacher als mit nativen Frameworks
4. **Dokumentation**: Web-Technologien sind extrem gut dokumentiert
5. **Flexibilität**: Frontend und Backend können unabhängig entwickelt werden

---

## 9. Detaillierte Klassen-Erklärungen

### 9.1 RocketLaunchService

```csharp
// Datei: RoMo.Server/Services/RocketLaunchService.cs
// Zweck: Raketenstarts von der Launch Library API abrufen und speichern

public class RocketLaunchService
{
    private readonly AppDbContext _context;      // Datenbankzugriff
    private readonly HttpClient _httpClient;     // HTTP-Client für API-Aufrufe
    private readonly ILogger<RocketLaunchService> _logger;  // Logging

    // Konstruktor: Dependencies werden von DI injiziert
    public RocketLaunchService(
        AppDbContext context,
        HttpClient httpClient,
        ILogger<RocketLaunchService> logger)
    {
        _context = context;
        _httpClient = httpClient;
        _logger = logger;
    }

    // Methode 1: Verfügbare Jahre ermitteln (1957 bis heute)
    public async Task<List<int>> GetAvailableYearsAsync()
    {
        try
        {
            // Erster Raketenstart der Geschichte abrufen
            string url = "https://ll.thespacedevs.com/2.2.0/launch/?ordering=net&limit=1";
            string response = await _httpClient.GetStringAsync(url);
            var data = JsonSerializer.Deserialize<LaunchLibraryResponse>(response);

            int startYear = 1957;  // Fallback: Sputnik 1957

            if (data?.Results?.Count > 0)
            {
                startYear = data.Results[0].Net.Year;
            }

            // Liste von startYear bis heute erstellen (neueste zuerst)
            var years = Enumerable.Range(startYear, DateTime.Now.Year - startYear + 1)
                .OrderByDescending(y => y)
                .ToList();

            return years;
        }
        catch (Exception ex)
        {
            _logger.LogWarning($"Fehler beim Abrufen: {ex.Message}");

            // Fallback: Standard-Bereich
            return Enumerable.Range(1957, DateTime.Now.Year - 1957 + 1)
                .OrderByDescending(y => y)
                .ToList();
        }
    }

    // Methode 2: Starts für ein Jahr abrufen und speichern
    public async Task<List<RocketLaunch>> FetchAndSaveLaunchesAsync(int year)
    {
        // 1. Prüfen ob Daten schon in DB sind (Caching)
        var existingLaunches = _context.RocketLaunches
            .Where(l => l.LaunchDate.Year == year)
            .ToList();

        if (existingLaunches.Any())
        {
            _logger.LogInformation($"Jahr {year} bereits in DB ({existingLaunches.Count} Starts)");
            return existingLaunches;
        }

        // 2. Von API abrufen (mit Pagination - 100 Einträge pro Seite)
        var allLaunches = new List<RocketLaunch>();
        int offset = 0;

        while (true)
        {
            // URL mit Datumsfilter
            string url = $"https://ll.thespacedevs.com/2.2.0/launch/" +
                $"?net__gte={year}-01-01" +    // Startet ab 1. Januar
                $"&net__lte={year}-12-31" +     // Bis 31. Dezember
                $"&include_suborbital=false" +  // Nur orbitale Starts
                $"&limit=100" +                 // 100 pro Seite
                $"&offset={offset}";            // Pagination

            string response = await _httpClient.GetStringAsync(url);
            var data = JsonSerializer.Deserialize<LaunchLibraryResponse>(response);

            if (data?.Results == null || data.Results.Count == 0)
                break;

            // 3. API-Daten in unsere Modelle umwandeln
            foreach (var result in data.Results)
            {
                allLaunches.Add(new RocketLaunch
                {
                    Name = result.Name,
                    LaunchDate = result.Net,
                    Status = MapStatus(result.Status?.Name),  // Status-Mapping
                    Agency = result.LaunchServiceProvider?.Name ?? "Unknown",
                    RocketType = result.Rocket?.Configuration?.Name,
                    ExternalId = result.Id
                });
            }

            // Nächste Seite?
            if (string.IsNullOrEmpty(data.Next))
                break;

            offset += 100;
        }

        // 4. In Datenbank speichern
        if (allLaunches.Any())
        {
            await _context.RocketLaunches.AddRangeAsync(allLaunches);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"{allLaunches.Count} Starts für {year} gespeichert");
        }

        return allLaunches;
    }

    // Hilfsmethode: API-Status auf unser Enum mappen
    private LaunchStatus MapStatus(string? statusName)
    {
        return statusName?.ToLower() switch
        {
            "success" => LaunchStatus.Success,
            "failure" => LaunchStatus.Failure,
            "partial failure" => LaunchStatus.Partial,
            _ => LaunchStatus.TBD
        };
    }
}
```

### 9.2 ChartAnalysisService

```csharp
// Datei: RoMo.Server/Services/ChartAnalysisService.cs
// Zweck: Datenanalyse und Chart-Daten erstellen

public class ChartAnalysisService
{
    private readonly AppDbContext _context;
    private readonly ILogger<ChartAnalysisService> _logger;

    public ChartAnalysisService(AppDbContext context, ILogger<ChartAnalysisService> logger)
    {
        _context = context;
        _logger = logger;
    }

    // ============== GENERISCHE CACHE-METHODEN ==============

    // Cache lesen (generisch für alle Chart-Typen)
    private async Task<T?> GetFromCacheAsync<T>(int year, string chartType) where T : class
    {
        var cache = await _context.ChartCache
            .FirstOrDefaultAsync(c => c.Year == year && c.ChartType == chartType);

        if (cache == null)
            return null;

        return JsonSerializer.Deserialize<T>(cache.JsonData);
    }

    // Cache schreiben (generisch für alle Chart-Typen)
    private async Task SaveToCacheAsync<T>(int year, string chartType, T data)
    {
        var existing = await _context.ChartCache
            .FirstOrDefaultAsync(c => c.Year == year && c.ChartType == chartType);

        string jsonData = JsonSerializer.Serialize(data);

        if (existing != null)
        {
            // Update
            existing.JsonData = jsonData;
            existing.CreatedAt = DateTime.UtcNow;
        }
        else
        {
            // Insert
            await _context.ChartCache.AddAsync(new ChartCache
            {
                Year = year,
                ChartType = chartType,
                JsonData = jsonData,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();
    }

    // ============== CHART 1: Mondphasen-Erfolgsrate (Bar Chart) ==============

    public async Task<MoonPhaseSuccessChartDTO> GetSuccessRateByMoonPhaseAsync(int year)
    {
        // 1. Cache prüfen
        var cached = await GetFromCacheAsync<MoonPhaseSuccessChartDTO>(year, "moon-phase-success");
        if (cached != null)
        {
            _logger.LogInformation($"Cache-Hit für moon-phase-success {year}");
            return cached;
        }

        // 2. Daten laden
        var launches = _context.RocketLaunches
            .Where(l => l.LaunchDate.Year == year)
            .ToList();

        var moonPhases = _context.MoonPhases
            .Where(m => m.Year == year)
            .OrderBy(m => m.Date)
            .ToList();

        // 3. Für jeden Start die nächste Mondphase finden
        var launchesWithPhase = launches.Select(launch =>
        {
            // Finde die Mondphase, die am nächsten zum Startdatum liegt
            var closestPhase = moonPhases
                .OrderBy(m => Math.Abs((m.Date - launch.LaunchDate).TotalDays))
                .FirstOrDefault();

            return new
            {
                Launch = launch,
                MoonPhase = closestPhase?.Phase ?? MoonPhase.NewMoon
            };
        }).ToList();

        // 4. Nach Mondphase gruppieren und Erfolgsrate berechnen
        var data = launchesWithPhase
            .GroupBy(l => l.MoonPhase)
            .Select(g => new MoonPhaseSuccessRate
            {
                MoonPhase = g.Key.ToString(),
                TotalLaunches = g.Count(),
                SuccessfulLaunches = g.Count(l => l.Launch.Status == LaunchStatus.Success),
                SuccessRate = g.Count() > 0
                    ? Math.Round(g.Count(l => l.Launch.Status == LaunchStatus.Success) * 100.0 / g.Count(), 2)
                    : 0
            })
            .OrderBy(x => x.MoonPhase)
            .ToList();

        var result = new MoonPhaseSuccessChartDTO { Data = data };

        // 5. Im Cache speichern
        await SaveToCacheAsync(year, "moon-phase-success", result);

        return result;
    }

    // ============== CHART 2: Status-Verteilung (Pie Chart) ==============

    public async Task<LaunchStatusChartDTO> GetLaunchStatusDistributionAsync(int year)
    {
        // Cache prüfen
        var cached = await GetFromCacheAsync<LaunchStatusChartDTO>(year, "launch-status");
        if (cached != null) return cached;

        var launches = _context.RocketLaunches
            .Where(l => l.LaunchDate.Year == year)
            .ToList();

        var total = launches.Count;

        // Nach Status gruppieren
        var data = launches
            .GroupBy(l => l.Status)
            .Select(g => new LaunchStatusDistribution
            {
                Status = g.Key.ToString(),
                Count = g.Count(),
                Percentage = total > 0
                    ? Math.Round(g.Count() * 100.0 / total, 2)
                    : 0
            })
            .OrderByDescending(x => x.Count)
            .ToList();

        var result = new LaunchStatusChartDTO { Data = data };
        await SaveToCacheAsync(year, "launch-status", result);

        return result;
    }

    // ============== CHART 3: Monatliche Timeline (Line Chart) ==============

    public async Task<LaunchTimelineChartDTO> GetLaunchTimelineAsync(int year)
    {
        // Cache prüfen
        var cached = await GetFromCacheAsync<LaunchTimelineChartDTO>(year, "launch-timeline");
        if (cached != null) return cached;

        var launches = _context.RocketLaunches
            .Where(l => l.LaunchDate.Year == year)
            .ToList();

        // Nach Monat gruppieren
        var launchesPerMonth = launches
            .GroupBy(l => l.LaunchDate.Month)
            .ToDictionary(g => g.Key, g => g.Count());

        // Alle 12 Monate erstellen (auch wenn 0 Starts)
        var data = Enumerable.Range(1, 12)
            .Select(month => new LaunchTimelinePoint
            {
                // Deutsche Monats-Abkürzungen
                Month = new DateTime(year, month, 1).ToString("MMM", new CultureInfo("de-DE")),
                LaunchCount = launchesPerMonth.ContainsKey(month) ? launchesPerMonth[month] : 0
            })
            .ToList();

        var result = new LaunchTimelineChartDTO { Data = data };
        await SaveToCacheAsync(year, "launch-timeline", result);

        return result;
    }
}
```

### 9.3 React-Komponenten

```tsx
// Datei: romo.client/src/App.tsx
// Zweck: Haupt-Komponente mit State-Management und Workflow

import { useState, useEffect } from 'react';
import { chartApi } from './services/chartApi';
import { MoonPhaseSuccessChart } from './components/MoonPhaseSuccessChart';
import { LaunchStatusChart } from './components/LaunchStatusChart';
import { LaunchTimelineChart } from './components/LaunchTimelineChart';
import { styles, colors } from './styles';

function App() {
    // ============== STATE MANAGEMENT ==============

    // Ausgewähltes Jahr (Standard: aktuelles Jahr)
    const [year, setYear] = useState<number>(new Date().getFullYear());

    // Liste aller verfügbaren Jahre
    const [availableYears, setAvailableYears] = useState<number[]>([]);

    // Loading-States
    const [isLoadingYears, setIsLoadingYears] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);

    // Fehler-State
    const [error, setError] = useState<string | null>(null);

    // ============== EFFEKTE ==============

    // Beim ersten Laden: Verfügbare Jahre abrufen
    useEffect(() => {
        const loadYears = async () => {
            try {
                setIsLoadingYears(true);
                const years = await chartApi.getAvailableYears();
                setAvailableYears(years);

                // Neuestes Jahr vorauswählen
                if (years.length > 0) {
                    setYear(years[0]);
                }
            } catch (err) {
                setError('Fehler beim Laden der Jahre');
                console.error(err);
            } finally {
                setIsLoadingYears(false);
            }
        };

        loadYears();
    }, []);  // Leeres Array = nur einmal beim Mount

    // ============== EVENT HANDLER ==============

    // "Daten laden" Button
    const handleInitialize = async () => {
        try {
            setIsInitializing(true);
            setError(null);

            // Backend aufrufen: Daten von APIs holen und speichern
            const result = await chartApi.initializeData(year);

            console.log(`Geladen: ${result.launchesCount} Starts, ${result.moonPhasesCount} Mondphasen`);
            setIsInitialized(true);
        } catch (err) {
            setError('Fehler beim Initialisieren der Daten');
            console.error(err);
        } finally {
            setIsInitializing(false);
        }
    };

    // ============== RENDER ==============

    return (
        <div style={styles.mainContainer}>
            {/* Header */}
            <header style={styles.header}>
                <h1 style={styles.headerTitle}>RocketMoon Analytics</h1>
                <p style={styles.headerSubtitle}>
                    Analyse von Raketenstarts und Mondphasen
                </p>
            </header>

            {/* Jahr-Auswahl */}
            <div style={styles.controlCard}>
                <div style={styles.controlRow}>
                    <label style={styles.label}>Jahr auswählen:</label>
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        style={styles.select}
                        disabled={isLoadingYears}
                    >
                        {availableYears.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleInitialize}
                        disabled={isInitializing}
                        style={styles.primaryButton}
                    >
                        {isInitializing ? 'Lädt...' : 'Daten laden'}
                    </button>
                </div>
            </div>

            {/* Fehler-Anzeige */}
            {error && (
                <div style={styles.errorMessage}>{error}</div>
            )}

            {/* Charts (nur wenn Daten geladen) */}
            {isInitialized && (
                <div style={styles.chartsGrid}>
                    <MoonPhaseSuccessChart year={year} />
                    <LaunchStatusChart year={year} />
                    <LaunchTimelineChart year={year} />
                </div>
            )}
        </div>
    );
}

export default App;
```

```tsx
// Datei: romo.client/src/components/MoonPhaseSuccessChart.tsx
// Zweck: Bar Chart für Mondphasen-Erfolgsrate

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { chartApi } from '../services/chartApi';
import { MoonPhaseSuccessRate } from '../types/chart.types';
import { ChartState } from './ChartState';
import { styles, colors } from '../styles';

interface Props {
    year: number;
}

export const MoonPhaseSuccessChart: React.FC<Props> = ({ year }) => {
    // State für Daten, Loading und Fehler
    const [data, setData] = useState<MoonPhaseSuccessRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Daten laden wenn sich das Jahr ändert
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // API aufrufen
                const result = await chartApi.getMoonPhaseSuccess(year);
                setData(result.data);
            } catch (err) {
                setError('Fehler beim Laden der Chart-Daten');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [year]);  // Abhängigkeit: year - lädt neu wenn Jahr sich ändert

    // Loading/Error/Empty States
    if (loading || error || data.length === 0) {
        return (
            <ChartState
                loading={loading}
                error={error}
                empty={data.length === 0}
                title="Erfolgsrate nach Mondphase"
            />
        );
    }

    return (
        <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Erfolgsrate nach Mondphase</h3>

            {/* ResponsiveContainer passt sich der Größe an */}
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />

                    {/* X-Achse: Mondphasen */}
                    <XAxis
                        dataKey="moonPhase"
                        tick={{ fontSize: 12 }}
                    />

                    {/* Y-Achse: Prozent (0-100) */}
                    <YAxis
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                    />

                    {/* Tooltip bei Hover */}
                    <Tooltip
                        formatter={(value: number) => [`${value}%`, 'Erfolgsrate']}
                    />

                    {/* Die Balken */}
                    <Bar
                        dataKey="successRate"
                        fill={colors.chart.bar}
                        radius={[8, 8, 0, 0]}  // Abgerundete Ecken oben
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
```

---

## Häufige Fragen bei der Verteidigung

### Q: Warum nutzt ihr async/await und nicht synchrone Aufrufe?

**A:** Ohne async würde die UI einfrieren während wir auf Daten warten. Bei HTTP-Requests zur externen API können das mehrere Sekunden sein. Mit async bleibt die Anwendung responsive - der Benutzer sieht einen Ladeindikator statt einer eingefrorenen App.

### Q: Was macht der generische Typ T genau?

**A:** T ist ein Platzhalter für einen beliebigen Typ. Bei `GetFromCacheAsync<T>()` ersetzt der Compiler T durch den konkreten Typ, z.B. `MoonPhaseSuccessChartDTO`. So können wir eine Methode schreiben, die für alle Chart-Typen funktioniert, statt drei separate Methoden.

### Q: Warum Entity Framework und nicht plain SQL?

**A:** Entity Framework spart viel Code - eine Zeile LINQ ersetzt 20 Zeilen SQL-Handling. Außerdem ist es typsicher: Tippfehler in Spaltennamen werden vom Compiler erkannt, nicht erst zur Laufzeit. Für unser Datenvolumen ist die Performance ausreichend.

### Q: Wie kommunizieren Frontend und Backend?

**A:** Über REST-API. Das Frontend sendet HTTP-Requests (GET/POST) an definierte Endpunkte wie `/api/chart/moon-phase-success?year=2025`. Das Backend verarbeitet die Anfrage, holt Daten aus der Datenbank, und sendet JSON zurück. Das Frontend deserialisiert das JSON und zeigt die Daten im Chart an.

### Q: Warum SQLite und nicht eine "richtige" Datenbank?

**A:** Die Anforderung war "ohne zusätzliche Installationen". SQLite ist serverlos - die Datenbank ist eine einzelne Datei. MySQL oder PostgreSQL würden einen separaten Server-Prozess brauchen, was auf Schulrechnern problematisch wäre.

### Q: Warum ein Web-Framework für eine Desktop-App?

**A:** Weil Recharts (unsere Chart-Library) ein React-Library ist. Web-Technologien bieten sehr gute Chart-Bibliotheken und modernes UI-Design ist einfacher. Die Alternative wäre WPF mit einer externen Chart-Library, was komplexer gewesen wäre.

### Q: Was passiert wenn der Port 5000 belegt ist?

**A:** Die Anwendung würde einen Fehler werfen. In einer Produktionsanwendung würde man entweder einen anderen Port konfigurierbar machen oder automatisch einen freien Port suchen.

### Q: Wie funktioniert das Caching?

**A:** Wenn Chart-Daten berechnet werden, speichern wir das Ergebnis als JSON in der `ChartCache`-Tabelle. Beim nächsten Aufruf prüfen wir zuerst den Cache. Wenn ein Eintrag existiert, laden wir das JSON und deserialisieren es - das ist viel schneller als alle Berechnungen neu durchzuführen.

---

## Glossar

| Begriff | Erklärung |
|---------|-----------|
| **async/await** | Schlüsselwörter für asynchrone Programmierung |
| **API** | Application Programming Interface - Schnittstelle für Programm-zu-Programm Kommunikation |
| **CORS** | Cross-Origin Resource Sharing - Browser-Sicherheitsmechanismus |
| **DbContext** | Entity Framework Klasse für Datenbankzugriff |
| **DTO** | Data Transfer Object - Objekt zum Datentransport |
| **EF** | Entity Framework - ORM für .NET |
| **Generic** | Typ-Parameter (T) für wiederverwendbaren Code |
| **LINQ** | Language Integrated Query - C# Abfragesprache |
| **ORM** | Object-Relational Mapping - Übersetzung zwischen Objekten und SQL |
| **REST** | Representational State Transfer - API-Architekturstil |
| **SQLite** | Serverlose, dateibasierte SQL-Datenbank |
| **Task** | Repräsentation einer asynchronen Operation |
