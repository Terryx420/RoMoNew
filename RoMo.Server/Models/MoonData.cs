namespace RoMo.Server.Models;

/// <summary>
/// Mondphasen-Daten Model - wird in SQLite gespeichert
/// Daten kommen von USNO Navy API
/// </summary>
public class MoonData
{
    public int Id { get; set; }
    
    /// <summary>
    /// Mondphase als Enum
    /// </summary>
    public MoonPhase Phase { get; set; }
    
    /// <summary>
    /// Datum der Mondphase
    /// </summary>
    public DateTime Date { get; set; }
    
    /// <summary>
    /// Jahr (für schnellere Queries)
    /// </summary>
    public int Year { get; set; }

    /// <summary>
    /// Navigationseigenschaft - alle Raketenstarts nahe dieser Mondphase (1:N)
    /// </summary>
    public ICollection<RocketLaunch> RocketLaunches { get; set; } = new List<RocketLaunch>();
}
