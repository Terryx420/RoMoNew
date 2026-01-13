using Microsoft.EntityFrameworkCore;
using RoMo.Data;
using RoMo.Services;
using System.Diagnostics;
using System.Runtime.InteropServices;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// Services Configuration
// ==========================================

// Add Controllers
builder.Services.AddControllers();

// Add Swagger (nur für Development)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add DbContext with SQLite (DB liegt neben .exe!)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=rocketmoon.db"));

// Add HttpClient für API Calls
builder.Services.AddHttpClient<RocketLaunchService>();
builder.Services.AddHttpClient<MoonDataService>();

// Add Services
builder.Services.AddScoped<RocketLaunchService>();
builder.Services.AddScoped<MoonDataService>();
builder.Services.AddScoped<ChartAnalysisService>();

// Add CORS (für standalone wichtig!)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add Logging
builder.Services.AddLogging(logging =>
{
    logging.AddConsole();
    logging.SetMinimumLevel(LogLevel.Information);
});

var app = builder.Build();

// ==========================================
// Database Initialization
// ==========================================

Console.WriteLine("🚀 Initializing RocketMoon Database...");
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated(); // Erstellt DB falls nicht vorhanden
    Console.WriteLine("✅ Database ready!");
}

// ==========================================
// Middleware Pipeline
// ==========================================

// Swagger nur in Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

// Static Files für Frontend (wwwroot)
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

// Fallback für SPA (alle anderen Routes → index.html)
app.MapFallbackToFile("index.html");

// ==========================================
// Welcome Message & Browser Auto-Open
// ==========================================


var appUrl = "http://localhost:5000";
string frontendUrl = "http://localhost:5173";

Console.WriteLine("╔══════════════════════════════════════════╗");
Console.WriteLine("║   🚀 RocketMoon App 🌙                  ║");
Console.WriteLine("╚══════════════════════════════════════════╝");
Console.WriteLine($"📡 Server: {appUrl}");
Console.WriteLine($"💾 Database: {Path.GetFullPath("rocketmoon.db")}");
Console.WriteLine($"🌐 Browser öffnet automatisch...");
Console.WriteLine();

// Öffne Browser automatisch
Task.Run(async () =>
{
    await Task.Delay(1500); // Warte kurz bis Server bereit
    try
    {
        OpenBrowser(appUrl);
        Console.WriteLine("✅ Browser geöffnet!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️ Browser konnte nicht automatisch geöffnet werden: {ex.Message}");
        Console.WriteLine($"   Öffne manuell: {appUrl}");
    }
});

app.Run();

// ==========================================
// Helper: Browser öffnen (Cross-Platform)
// ==========================================

static void OpenBrowser(string url)
{
    try
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
        }
        else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
        {
            Process.Start("xdg-open", url);
        }
        else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
        {
            Process.Start("open", url);
        }
    }
    catch
    {
        // Fallback: cmd /c start (Windows only)
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            Process.Start(new ProcessStartInfo("cmd", $"/c start {url}") { CreateNoWindow = true });
        }
    }
}