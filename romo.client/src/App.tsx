import { useState, useEffect } from 'react';
import { MoonPhaseSuccessChart } from './components/MoonPhaseSuccessChart';
import { LaunchStatusChart } from './components/LaunchStatusChart';
import { LaunchTimelineChart } from './components/LaunchTimelineChart';
import { chartApi } from './services/chartApi';

/**
 * RocketMoonApp - Hauptkomponente
 * Zeigt 3 Charts: BarChart, PieChart, LineChart
 */
function App() {
  const [year, setYear] = useState(2025);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [isLoadingYears, setIsLoadingYears] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Lade verfügbare Jahre beim Start
   */
  useEffect(() => {
    const loadYears = async () => {
      try {
        console.log('🔍 Loading available years...');
        const years = await chartApi.getAvailableYears();
        setAvailableYears(years);
        console.log(`✅ ${years.length} years: ${years[years.length - 1]} - ${years[0]}`);
      } catch (err) {
        console.error('❌ Failed to load years:', err);
        // Fallback: 1957 bis heute
        const currentYear = new Date().getFullYear();
        const fallback = Array.from(
          { length: currentYear - 1957 + 1 }, 
          (_, i) => currentYear - i
        );
        setAvailableYears(fallback);
      } finally {
        setIsLoadingYears(false);
      }
    };
    loadYears();
  }, []);

  /**
   * Initialisiert die Daten vom Backend
   * Muss vor dem Anzeigen der Charts aufgerufen werden!
   */
  const handleInitialize = async () => {
    setIsInitializing(true);
    setError(null);
    
    try {
      console.log(`🚀 Fetching data for year ${year}...`);
      const result = await chartApi.initializeData(year);
      console.log('✅ Initialization successful:', result);
      setIsInitialized(true);
    } catch (err: any) {
      console.error('❌ Initialization error:', err);
      
      // Detaillierte Fehlermeldung für fetch()
      let errorMessage = 'Fehler beim Laden der Daten. ';
      
      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage += '❌ Backend ist nicht erreichbar! Läuft das Backend? Starte es mit: dotnet run';
      } else if (err.message?.includes('HTTP 500')) {
        errorMessage += '❌ Backend-Fehler! Schau ins Backend-Terminal für Details.';
      } else if (err.message?.includes('HTTP 404')) {
        errorMessage += '❌ API Endpoint nicht gefunden! Falscher Pfad?';
      } else {
        errorMessage += err.message || 'Unbekannter Fehler';
      }
      
      setError(errorMessage);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '1400px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '20px'
      }}>
        <h1 style={{ 
          fontSize: '36px', 
          marginBottom: '10px',
          background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🚀 RocketMoon App 🌙
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>
          Analyse von Raketen-Starts und Mondphasen
        </p>
      </header>

      {/* Initialize Section */}
      {!isInitialized && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          marginBottom: '40px'
        }}>
          <h2 style={{ marginBottom: '20px' }}>
            Daten laden
          </h2>
          
          {/* Year Selector */}
          <div style={{ marginBottom: '30px' }}>
            <label 
              htmlFor="year-select" 
              style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              Wähle ein Jahr:
            </label>
            <select
              id="year-select"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              disabled={isLoadingYears || isInitializing}
              style={{
                padding: '12px 20px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                backgroundColor: 'white',
                cursor: isLoadingYears || isInitializing ? 'not-allowed' : 'pointer',
                minWidth: '200px',
                fontWeight: '500'
              }}
            >
              {isLoadingYears ? (
                <option>Lade Jahre...</option>
              ) : (
                availableYears.map(y => (
                  <option key={y} value={y}>
                    {y} {y === new Date().getFullYear() ? '(Aktuell)' : ''}
                  </option>
                ))
              )}
            </select>
            {availableYears.length > 0 && (
              <p style={{ 
                marginTop: '8px', 
                fontSize: '14px', 
                color: '#6b7280' 
              }}>
                {availableYears.length} Jahre verfügbar 
                ({availableYears[availableYears.length - 1]} - {availableYears[0]})
              </p>
            )}
          </div>

          <p style={{ marginBottom: '20px', color: '#6b7280' }}>
            Klicke auf "Daten laden" um Launch- und Mondphasen-Daten vom Backend zu fetchen.
            <br />
            (Dies kann 10-30 Sekunden dauern)
          </p>

          <button
            onClick={handleInitialize}
            disabled={isInitializing || isLoadingYears}
            style={{
              padding: '12px 32px',
              fontSize: '16px',
              backgroundColor: (isInitializing || isLoadingYears) ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (isInitializing || isLoadingYears) ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {isLoadingYears ? 'Lade Jahre...' : isInitializing ? 'Lädt...' : 'Daten laden'}
          </button>

          {error && (
            <div style={{ 
              marginTop: '20px', 
              padding: '12px', 
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '6px'
            }}>
              {error}
            </div>
          )}
        </div>
      )}

      {/* Charts Section */}
      {isInitialized && (
        <div>
          <div style={{ 
            marginBottom: '20px', 
            textAlign: 'center',
            padding: '12px',
            backgroundColor: '#dcfce7',
            borderRadius: '6px',
            color: '#166534'
          }}>
            ✅ Daten für {year} erfolgreich geladen!
          </div>

          {/* Chart 1: BarChart */}
          <div style={{ 
            marginBottom: '40px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <MoonPhaseSuccessChart year={year} />
          </div>

          {/* Chart 2: PieChart */}
          <div style={{ 
            marginBottom: '40px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <LaunchStatusChart year={year} />
          </div>

          {/* Chart 3: LineChart */}
          <div style={{ 
            marginBottom: '40px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <LaunchTimelineChart year={year} />
          </div>

          {/* Reload Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setIsInitialized(false)}
              style={{
                padding: '10px 24px',
                fontSize: '14px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Anderes Jahr laden
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        marginTop: '60px',
        padding: '20px',
        color: '#9ca3af',
        borderTop: '1px solid #e5e7eb'
      }}>
        <p>Schulprojekt 2025 - Raketen & Mondphasen Analyse</p>
      </footer>
    </div>
  );
}

export default App;