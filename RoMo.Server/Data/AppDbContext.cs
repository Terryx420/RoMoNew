using Microsoft.EntityFrameworkCore;
using RoMo.Server.Models;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace RoMo.Server.Data
{


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

            // RocketLaunch Configuration
            modelBuilder.Entity<RocketLaunch>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Agency).IsRequired().HasMaxLength(100);
                entity.Property(e => e.RocketType).HasMaxLength(100);
                entity.Property(e => e.Status).HasConversion<string>(); // Store enum as string
                entity.HasIndex(e => e.LaunchDate); // Index für Performance
                entity.HasIndex(e => e.MoonPhaseId); // Index für FK
            });

            // MoonData Configuration
            modelBuilder.Entity<MoonData>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Phase).HasConversion<string>(); // Store enum as string
                entity.HasIndex(e => e.Date); // Index für Performance
                entity.HasIndex(e => e.Year); // Index für Jahr-Queries
            });

            // ChartCache Configuration
            modelBuilder.Entity<ChartCache>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ChartType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.JsonData).IsRequired();
                entity.HasIndex(e => new { e.Year, e.ChartType }).IsUnique(); // Ein Cache pro Jahr und ChartType
            });
        }

    }

}
