namespace RoMo.Server.Models;

/// <summary>
/// Cache für berechnete Chart-Daten
/// KISS: Eine einfache Tabelle, JSON für Daten
/// </summary>
public class ChartCache
{
    public int Id { get; set; }

    /// <summary>
    /// Jahr der Daten
    /// </summary>
    public int Year { get; set; }

    /// <summary>
    /// Chart-Typ: moon-phase-success, launch-status, launch-timeline
    /// </summary>
    public string ChartType { get; set; } = string.Empty;

    /// <summary>
    /// Die Chart-Daten als JSON
    /// </summary>
    public string JsonData { get; set; } = string.Empty;

    /// <summary>
    /// Wann wurde der Cache erstellt
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
