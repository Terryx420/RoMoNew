using RoMo.Server.Data;
using RoMo.Server.DTOs;
using RoMo.Server.Models;
using System.Text.Json;

namespace Romo.Server.Services;

/// <summary>
/// Service zum Fetchen von Mondphasen-Daten von USNO Navy API
/// </summary>
public class MoonDataService
{
    private readonly HttpClient _httpClient;
    private readonly AppDbContext _context;
    private readonly ILogger<MoonDataService> _logger;

    public MoonDataService(
        HttpClient httpClient,
        AppDbContext context,
        ILogger<MoonDataService> logger)
    {
        _httpClient = httpClient;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Holt Mondphasen für ein Jahr von der API und speichert sie in der DB
    /// </summary>
    public async Task<List<MoonData>> FetchAndSaveMoonPhasesAsync(int year)
    {
        
        var existingData = _context.MoonPhases
            .Where(m => m.Year == year)
            .ToList();

        if (existingData.Any())
        {
            _logger.LogInformation("Moon phases for year {Year} already in database. Skipping fetch.", year);
            return existingData;
        }

        
        var url = $"https://aa.usno.navy.mil/api/moon/phases/year?year={year}";
        _logger.LogInformation("Fetching moon phases from: {Url}", url);

        try
        {
            var response = await _httpClient.GetStringAsync(url);
            var apiResponse = JsonSerializer.Deserialize<MoonApiResponse>(response);

            if (apiResponse?.PhaseData == null)
            {
                _logger.LogWarning("No moon phase data returned from API for year {Year}", year);
                return new List<MoonData>();
            }

            // Konvertiere API Response zu Models
            var moonPhases = apiResponse.PhaseData
                .Select(phase => new MoonData
                {
                    Phase = MapPhaseStringToEnum(phase.Phase),
                    Date = new DateTime(phase.Year, phase.Month, phase.Day),
                    Year = year
                })
                .ToList();

            
            await _context.MoonPhases.AddRangeAsync(moonPhases);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully fetched and saved {Count} moon phases for year {Year}",
                moonPhases.Count, year);

            return moonPhases;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error while fetching moon phases for year {Year}", year);
            throw;
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "JSON parsing error while processing moon phases for year {Year}", year);
            throw;
        }
    }

    /// <summary>
    /// Mapped den Phase-String von der API zu unser Enum
    /// </summary>
    private MoonPhase MapPhaseStringToEnum(string phaseString)
    {
        return phaseString.ToLower() switch
        {
            "new moon" => MoonPhase.NewMoon,
            "first quarter" => MoonPhase.FirstQuarter,
            "full moon" => MoonPhase.FullMoon,
            "last quarter" => MoonPhase.LastQuarter,
            _ => throw new ArgumentException($"Unknown moon phase: {phaseString}")
        };
    }
    
}
