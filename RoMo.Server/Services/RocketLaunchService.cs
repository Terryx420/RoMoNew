using System.Text.Json;
using RoMo.Server.Data;
using RoMo.Server.DTOs;
using RoMo.Server.Models;

namespace RoMo.Server.Services;

/// <summary>
/// Service zum Fetchen von Raketen-Launch-Daten von Launch Library 2 API
/// </summary>
public class RocketLaunchService
{
    private readonly HttpClient _httpClient;
    private readonly AppDbContext _context;
    private readonly ILogger<RocketLaunchService> _logger;

    public RocketLaunchService(
        HttpClient httpClient,
        AppDbContext context,
        ILogger<RocketLaunchService> logger)
    {
        _httpClient = httpClient;
        _context = context;
        _logger = logger;
    }
    
    /// <summary>
    /// Holt verfügbare Jahre von Launch Library 2
    /// Findet ältesten und neuesten Launch → Range erstellen
    /// </summary>
    public async Task<List<int>> GetAvailableYearsAsync()
    {
        _logger.LogInformation("Fetching available years from Launch Library 2...");

        try
        {
            // Ältesten Launch (ordering=net, limit=1)
            var oldestUrl = "https://ll.thespacedevs.com/2.2.0/launch/?ordering=net&limit=1";
            var oldestResponse = await _httpClient.GetStringAsync(oldestUrl);
            var oldestData = JsonSerializer.Deserialize<LaunchLibraryResponse>(oldestResponse);
            var oldestYear = oldestData?.Results?.FirstOrDefault()?.LaunchDate.Year ?? 1957;

            var currentYear = DateTime.Now.Year;

            // Range erstellen
            var years = Enumerable.Range(oldestYear, currentYear - oldestYear + 1)
                .OrderByDescending(y => y) // Neueste zuerst
                .ToList();

            _logger.LogInformation("✅ Available years: {OldestYear} - {NewestYear} ({Count} years)", 
                oldestYear, currentYear, years.Count);

            return years;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching available years");
            // Fallback: 1957 bis heute
            var currentYear = DateTime.Now.Year;
            return Enumerable.Range(1957, currentYear - 1957 + 1)
                .OrderByDescending(y => y)
                .ToList();
        }
    }

    /// <summary>
    /// Holt Launch-Daten für ein Jahr - MIT Pagination + optimierten Filtern
    /// </summary>
    public async Task<List<RocketLaunch>> FetchAndSaveLaunchesAsync(int year)
    {
        var existingData = _context.RocketLaunches
            .Where(l => l.LaunchDate.Year == year)
            .ToList();

        if (existingData.Any())
        {
            _logger.LogInformation("Launches for year {Year} already in database ({Count} launches).", year, existingData.Count);
            return existingData;
        }

        // Optimierte API URL - nur orbitale Starts, nur benötigte Felder
        var startDate = new DateTime(year, 1, 1).ToString("yyyy-MM-dd");
        var endDate = new DateTime(year, 12, 31).ToString("yyyy-MM-dd");
        var initialUrl = $"https://ll.thespacedevs.com/2.2.0/launch/" +
                        $"?net__gte={startDate}" +
                        $"&net__lte={endDate}" +
                        $"&include_suborbital=false" +  // Nur orbitale Starts
                        $"&limit=100";                   // 100 pro Seite
        
        _logger.LogInformation("Fetching launches for {Year} with pagination...", year);

        try
        {
            var allLaunches = new List<RocketLaunch>();
            var currentUrl = initialUrl;
            var pageCount = 0;

            while (!string.IsNullOrEmpty(currentUrl))
            {
                pageCount++;
                _logger.LogInformation("Page {Page}: {Url}", pageCount, currentUrl);

                var response = await _httpClient.GetStringAsync(currentUrl);
                var apiResponse = JsonSerializer.Deserialize<LaunchLibraryResponse>(response);

                if (apiResponse?.Results == null || !apiResponse.Results.Any())
                {
                    _logger.LogWarning("No more data on page {Page}", pageCount);
                    break;
                }

                var pageLaunches = apiResponse.Results
                    .Select(launch => new RocketLaunch
                    {
                        ExternalId = launch.Id,
                        Name = launch.Name,
                        LaunchDate = launch.LaunchDate,
                        Status = MapStatusToEnum(launch.Status?.Name ?? "TBD"),
                        Agency = launch.Agency?.Name ?? "Unknown",
                        RocketType = launch.Rocket?.Configuration?.Name ?? "Unknown"
                    })
                    .ToList();

                allLaunches.AddRange(pageLaunches);
                _logger.LogInformation("Page {Page}: +{Count} launches. Total: {Total}", 
                    pageCount, pageLaunches.Count, allLaunches.Count);

                currentUrl = apiResponse.Next;
            }

            if (allLaunches.Any())
            {
                await _context.RocketLaunches.AddRangeAsync(allLaunches);
                await _context.SaveChangesAsync();
                _logger.LogInformation("✅ Saved {Count} launches from {Pages} pages for {Year}", 
                    allLaunches.Count, pageCount, year);
            }

            return allLaunches;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching launches for {Year}", year);
            throw;
        }
    }

    /// <summary>
    /// Mapped den Status-String von der API zu unserem Enum
    /// Launch Library 2 Status IDs:
    /// 1 = Go, 2 = TBD, 3 = Success, 4 = Failure, 5 = Hold, 6 = In Flight, 7 = Partial Failure
    /// </summary>
    private LaunchStatus MapStatusToEnum(string statusName)
    {
        return statusName.ToLower() switch
        {
            string s when s.Contains("success") && !s.Contains("partial") => LaunchStatus.Success,
            string s when s.Contains("failure") || s.Contains("fail") => LaunchStatus.Failure,
            string s when s.Contains("partial") => LaunchStatus.Partial,
            _ => LaunchStatus.TBD
        };
    }

    /// <summary>
    /// Gibt die Launches für ein Jahr aus der DB zurück
    /// </summary>
    public async Task<List<RocketLaunch>> GetLaunchesForYearAsync(int year)
    {
        return await Task.FromResult(
            _context.RocketLaunches
                .Where(l => l.LaunchDate.Year == year)
                .OrderBy(l => l.LaunchDate)
                .ToList()
        );
    }
}