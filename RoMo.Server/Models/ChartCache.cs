namespace RoMo.Server.Models;

/// <summary>
/// Cache für berechnete Chart-Daten

/// </summary>
public class ChartCache
{
    public int Id { get; set; }

    public int Year { get; set; }

    public string ChartType { get; set; } = string.Empty;
    
    public string JsonData { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
