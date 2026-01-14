using Microsoft.EntityFrameworkCore;
using RoMo.Server.Models;

namespace RoMo.Server.Data;

///<summary>
/// AppDbContext - Entity Framework Core Datenbankkontext
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<RocketLaunch> RocketLaunches => Set<RocketLaunch>();
    public DbSet<MoonData> MoonPhases => Set<MoonData>();
    public DbSet<ChartCache> ChartCache => Set<ChartCache>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // RocketLaunch Konfiguration
        modelBuilder.Entity<RocketLaunch>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Agency).IsRequired().HasMaxLength(100);
            entity.Property(e => e.RocketType).HasMaxLength(100);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasIndex(e => e.LaunchDate); 
            entity.HasIndex(e => e.MoonPhaseId); 
        });

        // MoonData Konfiguration
        modelBuilder.Entity<MoonData>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Phase).HasConversion<string>(); 
            entity.HasIndex(e => e.Date); 
            entity.HasIndex(e => e.Year);
        });

        // ChartCache Konfiguration
        modelBuilder.Entity<ChartCache>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ChartType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.JsonData).IsRequired();
            entity.HasIndex(e => new { e.Year, e.ChartType }).IsUnique(); // Ein Cache pro Jahr und ChartType
        });
    }
}

