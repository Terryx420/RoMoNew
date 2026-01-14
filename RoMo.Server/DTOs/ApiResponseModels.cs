using System.Text.Json.Serialization;

namespace RoMo.Server.DTOs;

/// <summary>
/// Root Response von Launch Library 2 API
/// Endpoint: https://ll.thespacedevs.com/2.2.0/launch/?limit=100
/// </summary>
public class LaunchLibraryResponse
{
    [JsonPropertyName("count")]
    public int Count { get; set; }
    
    [JsonPropertyName("next")]
    public string? Next { get; set; }
    
    [JsonPropertyName("previous")]
    public string? Previous { get; set; }
    
    [JsonPropertyName("results")]
    public List<LaunchResult> Results { get; set; } = new();
}

/// <summary>
/// Einzelner Launch aus der API
/// </summary>
public class LaunchResult
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("net")]
    public DateTime LaunchDate { get; set; }
    
    [JsonPropertyName("status")]
    public LaunchStatusResult Status { get; set; } = new();
    
    [JsonPropertyName("launch_service_provider")]
    public LaunchServiceProvider? Agency { get; set; }
    
    [JsonPropertyName("rocket")]
    public RocketInfo? Rocket { get; set; }
}

public class LaunchStatusResult
{
    [JsonPropertyName("id")]
    public int Id { get; set; }
    
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}

public class LaunchServiceProvider
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}

public class RocketInfo
{
    [JsonPropertyName("configuration")]
    public RocketConfiguration? Configuration { get; set; }
}

public class RocketConfiguration
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}



/// <summary>
/// Root Response von USNO Navy Moon API
/// Endpoint: https://aa.usno.navy.mil/api/moon/phases/year?year=2025
/// </summary>
public class MoonApiResponse
{
    [JsonPropertyName("year")]
    public int Year { get; set; }
    
    [JsonPropertyName("phasedata")]
    public List<MoonPhaseData> PhaseData { get; set; } = new();
}

/// <summary>
/// Einzelne Mondphase aus der API
/// </summary>
public class MoonPhaseData
{
    [JsonPropertyName("year")]
    public int Year { get; set; }
    
    [JsonPropertyName("month")]
    public int Month { get; set; }
    
    [JsonPropertyName("day")]
    public int Day { get; set; }
    
    [JsonPropertyName("phase")]
    public string Phase { get; set; } = string.Empty;
    
    [JsonPropertyName("time")]
    public string? Time { get; set; }
}