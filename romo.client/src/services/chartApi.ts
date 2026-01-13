import type {
  InitResponse,
  MoonPhaseSuccessChartDTO,
  LaunchStatusChartDTO,
  LaunchTimelineChartDTO
} from '../types/chart.types';

// Backend URL - Automatische Erkennung
const API_BASE_URL = 'http://localhost:5000/api';

console.log('🔧 API Base URL:', API_BASE_URL);

/**
 * Simple fetch wrapper - KISS!
 */
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`📤 ${options?.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`📥 Error ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`📥 Response:`, data);
    return data;
  } catch (error) {
    console.error('📥 Fetch Error:', error);
    throw error;
  }
}

/**
 * Chart API Service - Vanilla Fetch!
 */
export const chartApi = {
  /**
   * Holt alle verfügbaren Jahre (1957 - heute)
   */
  getAvailableYears: async (): Promise<number[]> => {
    return apiCall<number[]>('/chart/available-years');
  },

  /**
   * Initialisiert die Daten für ein Jahr
   * Muss VOR den Chart-Requests aufgerufen werden!
   * ⚠️ Kann 10-60 Sekunden dauern! (Externe APIs)
   */
  initializeData: async (year: number): Promise<InitResponse> => {
    console.log(`🚀 Initializing data for year ${year}...`);
    const data = await apiCall<InitResponse>(`/chart/init/${year}`, {
      method: 'POST',
    });
    console.log(`✅ Data initialized:`, data);
    return data;
  },

  /**
   * Chart 1: BarChart - Erfolgsrate pro Mondphase
   */
  getMoonPhaseSuccess: async (year: number = 2025): Promise<MoonPhaseSuccessChartDTO> => {
    return apiCall<MoonPhaseSuccessChartDTO>(`/chart/moon-phase-success?year=${year}`);
  },

  /**
   * Chart 2: PieChart - Launch-Status Verteilung
   */
  getLaunchStatus: async (year: number = 2025): Promise<LaunchStatusChartDTO> => {
    return apiCall<LaunchStatusChartDTO>(`/chart/launch-status?year=${year}`);
  },

  /**
   * Chart 3: LineChart - Anzahl Starts pro Monat
   */
  getLaunchTimeline: async (year: number = 2025): Promise<LaunchTimelineChartDTO> => {
    return apiCall<LaunchTimelineChartDTO>(`/chart/launch-timeline?year=${year}`);
  }
};