using Microsoft.EntityFrameworkCore;
using Romo.Server.Services;
using RoMo.Server.Data;
using RoMo.Server.Services;
using System.Diagnostics;
using System.Runtime.InteropServices;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// Services Configuration
// ==========================================

builder.Services.AddControllers();

// SQLite Database (neben der .exe)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=rocketmoon.db"));

// HttpClient für externe APIs
builder.Services.AddHttpClient<RocketLaunchService>();
builder.Services.AddHttpClient<MoonDataService>();

// Services
builder.Services.AddScoped<RocketLaunchService>();
builder.Services.AddScoped<MoonDataService>();
builder.Services.AddScoped<ChartAnalysisService>();

// CORS (nur für Development mit separatem Vite-Server)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();


Console.WriteLine("Initializing RocketMoon Database...");
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    Console.WriteLine("Database ready!");
}


var isDevelopment = app.Environment.IsDevelopment();

app.UseCors("AllowAll");

// Static Files für Production (Frontend in wwwroot)
if (!isDevelopment)
{
    app.UseDefaultFiles();
    app.UseStaticFiles();
}

app.UseAuthorization();
app.MapControllers();


// ==========================================
// Startup Info & Browser Auto-Open
// ==========================================

var port = isDevelopment ? 5181 : 5000;
var appUrl = $"http://localhost:{port}";

Console.WriteLine();
Console.WriteLine("╔══════════════════════════════════════════╗");
Console.WriteLine("║   🚀 RocketMoon App 🌙                   ║");
Console.WriteLine("╚══════════════════════════════════════════╝");
Console.WriteLine($"📡 Server: {appUrl}");
Console.WriteLine($"💾 Database: {Path.GetFullPath("rocketmoon.db")}");
Console.WriteLine($"🔧 Mode: {(isDevelopment ? "Development" : "Production")}");

if (isDevelopment)
{
    Console.WriteLine($"🌐 Frontend: http://localhost:5173 (Vite dev server)");
}
else
{
    Console.WriteLine($"🌐 Browser öffnet automatisch...");

    // Auto-open browser in Production
    _ = Task.Run(async () =>
    {
        await Task.Delay(1500);
        try
        {
            OpenBrowser(appUrl);
            Console.WriteLine("✅ Browser geöffnet!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ Browser konnte nicht geöffnet werden: {ex.Message}");
            Console.WriteLine($"   Öffne manuell: {appUrl}");
        }
    });
}

Console.WriteLine();

app.Run();


static void OpenBrowser(string url)
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
