namespace RoMo.Server.Models;

/// <summary>
/// Raketen-Start Model - wird in SQLite gespeichert
/// </summary>
public class RocketLaunch
{
    public int Id { get; set; }
    
    /// <summary>
    /// Name der Rakete/Mission
    /// </summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// Start-Datum und Uhrzeit
    /// </summary>
    public DateTime LaunchDate { get; set; }
    
    /// <summary>
    /// Status: Success, Failure, Partial, TBD
    /// </summary>
    public LaunchStatus Status { get; set; }
    
    /// <summary>
    /// Agentur (z.B. SpaceX, NASA, ESA)
    /// </summary>
    public string Agency { get; set; } = string.Empty;
    
    /// <summary>
    /// Raketen-Typ (z.B. Falcon 9, Soyuz)
    /// </summary>
    public string RocketType { get; set; } = string.Empty;
    
    /// <summary>
    /// Launch Library 2 ID (für Referenz)
    /// </summary>
    public string? ExternalId { get; set; }

    /// <summary>
    /// Fremdschlüssel zur Mondphase (N:1 Beziehung)
    /// </summary>
    public int? MoonPhaseId { get; set; }
}
