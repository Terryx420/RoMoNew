namespace RoMo.Server.Models;

/// <summary>
/// Mondphasen-Daten Model - wird in SQLite gespeichert
/// </summary>
public class MoonData
{
    public int Id { get; set; }
    
    public MoonPhase Phase { get; set; }
    
    public DateTime Date { get; set; }
    
    public int Year { get; set; }
}
