namespace RoMo.Server.Models;

/// <summary>
/// Mondphasen-Enum basierend auf USNO Navy API
/// </summary>
public enum MoonPhase
{
    NewMoon,
    FirstQuarter,
    FullMoon,
    LastQuarter
}

/// <summary>
/// Status eines Raketen-Starts
/// </summary>
public enum LaunchStatus
{
    Success,
    Failure,
    Partial,
    TBD
}
