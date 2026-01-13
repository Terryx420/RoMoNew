using RoMo.Server.DTOs;
namespace RoMo.Server.DTOs;

/// <summary>
/// Universelles Chart-DTO für alle Chart-Typen
/// </summary>
public class ChartDataDTO
{
    /// <summary>
    /// Chart-Typ: "bar", "pie", "line"
    /// </summary>
    public string ChartType { get; set; } = string.Empty;
    
    /// <summary>
    /// Titel des Charts (optional)
    /// </summary>
    public string? Title { get; set; }
    
    /// <summary>
    /// Jahr der Daten
    /// </summary>
    public int Year { get; set; }
}

/// <summary>
/// Chart-DTO für BarChart: Erfolgsrate pro Mondphase
/// </summary>
public class MoonPhaseSuccessChartDTO : ChartDataDTO
{
    public List<MoonPhaseSuccessRate> Data { get; set; } = new();
}

/// <summary>
/// Chart-DTO für PieChart: Launch-Status Verteilung
/// </summary>
public class LaunchStatusChartDTO : ChartDataDTO
{
    public List<LaunchStatusDistribution> Data { get; set; } = new();
}

/// <summary>
/// Chart-DTO für LineChart: Starts pro Monat
/// </summary>
public class LaunchTimelineChartDTO : ChartDataDTO
{
    public List<LaunchTimelinePoint> Data { get; set; } = new();
}
