using RoMo.Server.Data;
using RoMo.Server.DTOs;
using RoMo.Server.Models;
using System.Globalization;

namespace RoMo.Server.Services;

/// <summary>
/// Service zur Analyse von Launch- und Mondphasen-Daten für Charts
/// KISS-Prinzip: Einfache, verständliche Methoden
/// </summary>
public class ChartAnalysisService
{
    private readonly AppDbContext _context;
    private readonly ILogger<ChartAnalysisService> _logger;

    public ChartAnalysisService(AppDbContext context, ILogger<ChartAnalysisService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Chart 1: BarChart - Erfolgsrate pro Mondphase
    /// </summary>
    public async Task<MoonPhaseSuccessChartDTO> GetSuccessRateByMoonPhaseAsync(int year)
    {
        _logger.LogInformation("Calculating success rate by moon phase for year {Year}", year);

        // 1. Hole alle Launches des Jahres
        var launches = _context.RocketLaunches
            .Where(l => l.LaunchDate.Year == year)
            .OrderBy(l => l.LaunchDate)
            .ToList();

        // 2. Hole alle Mondphasen des Jahres
        var moonPhases = _context.MoonPhases
            .Where(m => m.Year == year)
            .OrderBy(m => m.Date)
            .ToList();

        if (!launches.Any() || !moonPhases.Any())
        {
            _logger.LogWarning("No data found for year {Year}. Launches: {LC}, MoonPhases: {MC}", 
                year, launches.Count, moonPhases.Count);
            return new MoonPhaseSuccessChartDTO 
            { 
                ChartType = "bar", 
                Year = year,
                Title = "Erfolgsrate pro Mondphase",
                Data = new List<MoonPhaseSuccessRate>() 
            };
        }

        // 3. Für jeden Launch die nächste Mondphase finden
        var launchesWithPhase = launches.Select(launch => new
        {
            Launch = launch,
            MoonPhase = FindClosestMoonPhase(launch.LaunchDate, moonPhases)
        }).ToList();

        // 4. Nach Mondphase gruppieren und Erfolgsrate berechnen
        var data = launchesWithPhase
            .GroupBy(x => x.MoonPhase)
            .Select(group => new MoonPhaseSuccessRate
            {
                MoonPhase = FormatMoonPhase(group.Key),
                TotalLaunches = group.Count(),
                SuccessfulLaunches = group.Count(x => x.Launch.Status == LaunchStatus.Success),
                SuccessRate = CalculateSuccessRate(
                    group.Count(x => x.Launch.Status == LaunchStatus.Success),
                    group.Count()
                )
            })
            .OrderBy(x => GetPhaseOrder(x.MoonPhase))
            .ToList();

        _logger.LogInformation("Success rate calculation complete. Found {Count} moon phases with data", data.Count);

        return await Task.FromResult(new MoonPhaseSuccessChartDTO
        {
            ChartType = "bar",
            Year = year,
            Title = "Erfolgsrate pro Mondphase",
            Data = data
        });
    }

    /// <summary>
    /// Chart 2: PieChart - Verteilung nach Launch-Status
    /// </summary>
    public async Task<LaunchStatusChartDTO> GetLaunchStatusDistributionAsync(int year)
    {
        _logger.LogInformation("Calculating launch status distribution for year {Year}", year);

        var launches = _context.RocketLaunches
            .Where(l => l.LaunchDate.Year == year)
            .ToList();

        if (!launches.Any())
        {
            _logger.LogWarning("No launches found for year {Year}", year);
            return new LaunchStatusChartDTO
            {
                ChartType = "pie",
                Year = year,
                Title = "Launch-Status Verteilung",
                Data = new List<LaunchStatusDistribution>()
            };
        }

        var totalLaunches = launches.Count;

        var data = launches
            .GroupBy(l => l.Status)
            .Select(group => new LaunchStatusDistribution
            {
                Status = FormatStatus(group.Key),
                Count = group.Count(),
                Percentage = Math.Round((decimal)group.Count() / totalLaunches * 100, 1)
            })
            .OrderByDescending(x => x.Count)
            .ToList();

        _logger.LogInformation("Status distribution complete. Total launches: {Total}", totalLaunches);

        return await Task.FromResult(new LaunchStatusChartDTO
        {
            ChartType = "pie",
            Year = year,
            Title = "Launch-Status Verteilung",
            Data = data
        });
    }

    /// <summary>
    /// Chart 3: LineChart - Anzahl Starts pro Monat
    /// </summary>
    public async Task<LaunchTimelineChartDTO> GetLaunchTimelineAsync(int year)
    {
        _logger.LogInformation("Calculating launch timeline for year {Year}", year);

        var launches = _context.RocketLaunches
            .Where(l => l.LaunchDate.Year == year)
            .ToList();

        // Erstelle alle 12 Monate (auch wenn 0 Launches)
        var data = Enumerable.Range(1, 12)
            .Select(month => new LaunchTimelinePoint
            {
                Month = GetMonthName(month),
                MonthNumber = month,
                LaunchCount = launches.Count(l => l.LaunchDate.Month == month)
            })
            .ToList();

        _logger.LogInformation("Timeline calculation complete. Total launches: {Total}", launches.Count);

        return await Task.FromResult(new LaunchTimelineChartDTO
        {
            ChartType = "line",
            Year = year,
            Title = "Raketen-Starts pro Monat",
            Data = data
        });
    }

    // ==========================================
    // Hilfsmethoden
    // ==========================================

    /// <summary>
    /// Findet die nächste Mondphase zum gegebenen Datum
    /// </summary>
    private MoonPhase FindClosestMoonPhase(DateTime launchDate, List<MoonData> moonPhases)
    {
        var closest = moonPhases
            .OrderBy(m => Math.Abs((m.Date - launchDate).TotalDays))
            .FirstOrDefault();

        return closest?.Phase ?? MoonPhase.NewMoon;
    }

    /// <summary>
    /// Berechnet die Erfolgsrate in Prozent
    /// </summary>
    private decimal CalculateSuccessRate(int successful, int total)
    {
        if (total == 0) return 0;
        return Math.Round((decimal)successful / total * 100, 1);
    }

    /// <summary>
    /// Formatiert MoonPhase Enum zu lesbarem String
    /// </summary>
    private string FormatMoonPhase(MoonPhase phase)
    {
        return phase switch
        {
            MoonPhase.NewMoon => "New Moon",
            MoonPhase.FirstQuarter => "First Quarter",
            MoonPhase.FullMoon => "Full Moon",
            MoonPhase.LastQuarter => "Last Quarter",
            _ => phase.ToString()
        };
    }

    /// <summary>
    /// Formatiert LaunchStatus Enum zu lesbarem String
    /// </summary>
    private string FormatStatus(LaunchStatus status)
    {
        return status switch
        {
            LaunchStatus.Success => "Success",
            LaunchStatus.Failure => "Failure",
            LaunchStatus.Partial => "Partial Success",
            LaunchStatus.TBD => "TBD",
            _ => status.ToString()
        };
    }

    /// <summary>
    /// Gibt die Sortier-Reihenfolge für Mondphasen zurück
    /// </summary>
    private int GetPhaseOrder(string phase)
    {
        return phase switch
        {
            "New Moon" => 1,
            "First Quarter" => 2,
            "Full Moon" => 3,
            "Last Quarter" => 4,
            _ => 5
        };
    }

    /// <summary>
    /// Gibt den Monatsnamen zurück (Jan, Feb, Mar, ...)
    /// </summary>
    private string GetMonthName(int month)
    {
        return CultureInfo.GetCultureInfo("de-DE").DateTimeFormat.GetAbbreviatedMonthName(month);
    }
}
