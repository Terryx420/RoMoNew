// ==========================================
// Chart Data Types - matchen Backend DTOs
// ==========================================

export interface ChartDataDTO {
  chartType: string;
  title?: string;
  year: number;
}

// Chart 1: BarChart - Erfolgsrate pro Mondphase
export interface MoonPhaseSuccessChartDTO extends ChartDataDTO {
  data: MoonPhaseSuccessRate[];
}

export interface MoonPhaseSuccessRate {
  moonPhase: string;
  successRate: number;
  totalLaunches: number;
  successfulLaunches: number;
}

// Chart 2: PieChart - Launch-Status Verteilung
export interface LaunchStatusChartDTO extends ChartDataDTO {
  data: LaunchStatusDistribution[];
}

export interface LaunchStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

// Chart 3: LineChart - Starts pro Monat
export interface LaunchTimelineChartDTO extends ChartDataDTO {
  data: LaunchTimelinePoint[];
}

export interface LaunchTimelinePoint {
  month: string;
  monthNumber: number;
  launchCount: number;
}

// Init Response
export interface InitResponse {
  year: number;
  moonPhasesCount: number;
  launchesCount: number;
  message: string;
}
