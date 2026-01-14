namespace RoMo.Server.Models;

/// <summary>
/// Raketen-Start Model - wird in SQLite gespeichert
/// </summary>
public class RocketLaunch
{
    public int Id { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public DateTime LaunchDate { get; set; }
    
    public LaunchStatus Status { get; set; }
    
    public string Agency { get; set; } = string.Empty;
    
    public string RocketType { get; set; } = string.Empty;
    
    public string? ExternalId { get; set; }

    public int? MoonPhaseId { get; set; }
}
