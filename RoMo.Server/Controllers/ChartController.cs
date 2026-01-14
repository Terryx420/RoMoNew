using Microsoft.AspNetCore.Mvc;
using Romo.Server.Services;
using RoMo.Server.DTOs;
using RoMo.Server.Services;

namespace RoMo.Server.Controllers;

/// <summary>
/// Chart-Controller - Schnittstelle zum Frontend
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ChartController : ControllerBase
{
    private readonly RocketLaunchService _launchService;
    private readonly MoonDataService _moonService;
    private readonly ChartAnalysisService _analysisService;
    private readonly ILogger<ChartController> _logger;

    public ChartController(
        RocketLaunchService launchService,
        MoonDataService moonService,
        ChartAnalysisService analysisService,
        ILogger<ChartController> logger)
    {
        _launchService = launchService;
        _moonService = moonService;
        _analysisService = analysisService;
        _logger = logger;
    }

    /// <summary>
    /// GET /api/chart/available-years
    /// Gibt alle verfügbaren Jahre zurück (1957 - heute)
    /// </summary>
    [HttpGet("available-years")]
    public async Task<ActionResult<List<int>>> GetAvailableYears()
    {
        try
        {
            _logger.LogInformation("Fetching available years...");
            var years = await _launchService.GetAvailableYearsAsync();
            return Ok(years);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting available years");
            return StatusCode(500, new { error = "Failed to fetch available years", details = ex.Message });
        }
    }

    /// <summary>
    /// Initialisiert die Daten für ein Jahr
    /// Muss VOR den Chart-Requests aufgerufen werden!
    /// </summary>
    [HttpPost("init/{year}")]
    public async Task<IActionResult> InitializeData(int year)
    {
        _logger.LogInformation("Initializing data for year {Year}", year);

        try
        {
            // Fetch Moon Phases
            var moonPhases = await _moonService.FetchAndSaveMoonPhasesAsync(year);
            
            // Fetch Rocket Launches
            var launches = await _launchService.FetchAndSaveLaunchesAsync(year);

            return Ok(new
            {
                year,
                moonPhasesCount = moonPhases.Count,
                launchesCount = launches.Count,
                message = $"Data for {year} initialized successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing data for year {Year}", year);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Chart 1: BarChart - Erfolgsrate pro Mondphase
    /// GET /api/chart/moon-phase-success?year=2025
    /// </summary>
    [HttpGet("moon-phase-success")]
    public async Task<ActionResult<MoonPhaseSuccessChartDTO>> GetMoonPhaseSuccess(
        [FromQuery] int year = 2025)
    {
        _logger.LogInformation("Getting moon phase success chart for year {Year}", year);

        try
        {
            var result = await _analysisService.GetSuccessRateByMoonPhaseAsync(year);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting moon phase success chart for year {Year}", year);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Chart 2: PieChart - Launch-Status Verteilung
    /// GET /api/chart/launch-status?year=2025
    /// </summary>
    [HttpGet("launch-status")]
    public async Task<ActionResult<LaunchStatusChartDTO>> GetLaunchStatus(
        [FromQuery] int year = 2025)
    {
        _logger.LogInformation("Getting launch status chart for year {Year}", year);

        try
        {
            var result = await _analysisService.GetLaunchStatusDistributionAsync(year);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting launch status chart for year {Year}", year);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Chart 3: LineChart - Anzahl Starts pro Monat
    /// GET /api/chart/launch-timeline?year=2025
    /// </summary>
    [HttpGet("launch-timeline")]
    public async Task<ActionResult<LaunchTimelineChartDTO>> GetLaunchTimeline(
        [FromQuery] int year = 2025)
    {
        _logger.LogInformation("Getting launch timeline chart for year {Year}", year);

        try
        {
            var result = await _analysisService.GetLaunchTimelineAsync(year);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting launch timeline chart for year {Year}", year);
            return StatusCode(500, new { error = ex.Message });
        }
    }
}