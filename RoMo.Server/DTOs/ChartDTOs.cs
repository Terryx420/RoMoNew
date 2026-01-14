namespace RoMo.Server.DTOs;

/// <summary>
/// BarChart Data: Erfolgsrate pro Mondphase
/// </summary>
public class MoonPhaseSuccessRate
{
    /// <summary>
    /// Mondphase (für X-Achse) - z.B. "New Moon", "Full Moon"
    /// </summary>
    public string MoonPhase { get; set; } = string.Empty;
    
    /// <summary>
    /// Erfolgsrate in Prozent (für Y-Achse) - 0 bis 100
    /// </summary>
    public decimal SuccessRate { get; set; }
    
    /// <summary>
    /// Gesamtanzahl Launches in dieser Mondphase (für Tooltip)
    /// </summary>
    public int TotalLaunches { get; set; }
    
    /// <summary>
    /// Erfolgreiche Launches (für Tooltip)
    /// </summary>
    public int SuccessfulLaunches { get; set; }
}

/// <summary>
/// PieChart Data: Verteilung nach Launch-Status
/// </summary>
public class LaunchStatusDistribution
{
    /// <summary>
    /// Status-Name (für Slice-Label) - "Success", "Failure", "Partial"
    /// </summary>
    public string Status { get; set; } = string.Empty;
    
    /// <summary>
    /// Anzahl (für Slice-Größe)
    /// </summary>
    public int Count { get; set; }
    
    /// <summary>
    /// Prozentsatz vom Gesamt (für Tooltip)
    /// </summary>
    public decimal Percentage { get; set; }
}

/// <summary>
/// LineChart Data: Anzahl Starts pro Monat
/// </summary>
public class LaunchTimelinePoint
{
    /// <summary>
    /// Monat (für X-Achse) - z.B. "Jan", "Feb", "Mar"
    /// </summary>
    public string Month { get; set; } = string.Empty;
    
    /// <summary>
    /// Monatsnummer (1-12) - für Sortierung
    /// </summary>
    public int MonthNumber { get; set; }
    
    /// <summary>
    /// Anzahl Launches (für Y-Achse)
    /// </summary>
    public int LaunchCount { get; set; }
}
