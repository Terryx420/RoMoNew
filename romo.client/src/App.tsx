import { useState, useEffect } from 'react';
import { MoonPhaseSuccessChart } from './components/MoonPhaseSuccessChart';
import { LaunchStatusChart } from './components/LaunchStatusChart';
import { LaunchTimelineChart } from './components/LaunchTimelineChart';
import { chartApi } from './services/chartApi';
import {
  colors,
  mainContainer,
  headerStyle,
  headerTitle,
  headerSubtitle,
  initSection,
  labelStyle,
  selectStyle,
  helperText,
  buttonPrimary,
  buttonDisabled,
  errorMessage,
  successMessage,
  cardStyle,
  buttonSecondary,
  footerStyle,
  spacing,
} from './styles';

function App() {
  const [year, setYear] = useState(2025);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [isLoadingYears, setIsLoadingYears] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadYears = async () => {
      try {
        const years = await chartApi.getAvailableYears();
        setAvailableYears(years);
      } catch {
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

  const handleInitialize = async () => {
    setIsInitializing(true);
    setError(null);

    try {
      await chartApi.initializeData(year);
      setIsInitialized(true);
    } catch (err: unknown) {
      const e = err as Error & { message?: string };
      let errorMsg = 'Fehler beim Laden der Daten. ';

      if (err instanceof TypeError && e.message?.includes('fetch')) {
        errorMsg += 'Backend nicht erreichbar! Starte es mit: dotnet run';
      } else if (e.message?.includes('HTTP 500')) {
        errorMsg += 'Backend-Fehler! Schau ins Backend-Terminal.';
      } else if (e.message?.includes('HTTP 404')) {
        errorMsg += 'API Endpoint nicht gefunden!';
      } else {
        errorMsg += e.message || 'Unbekannter Fehler';
      }

      setError(errorMsg);
    } finally {
      setIsInitializing(false);
    }
  };

  const isDisabled = isInitializing || isLoadingYears;

  return (
    <div style={mainContainer}>
      <header style={headerStyle}>
        <h1 style={headerTitle}>RocketMoon App</h1>
        <p style={headerSubtitle}>Analyse von Raketen-Starts und Mondphasen</p>
      </header>

      {!isInitialized && (
        <div style={initSection}>
          <h2 style={{ marginBottom: spacing.lg }}>Daten laden</h2>

          <div style={{ marginBottom: '30px' }}>
            <label htmlFor="year-select" style={labelStyle}>
              Wähle ein Jahr:
            </label>
            <select
              id="year-select"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              disabled={isDisabled}
              style={{
                ...selectStyle,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
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
              <p style={helperText}>
                {availableYears.length} Jahre verfügbar
                ({availableYears[availableYears.length - 1]} - {availableYears[0]})
              </p>
            )}
          </div>

          <p style={{ marginBottom: spacing.lg, color: colors.gray }}>
            Klicke auf "Daten laden" um Launch- und Mondphasen-Daten zu fetchen.
            <br />
            (Dies kann 10-30 Sekunden dauern)
          </p>

          <button
            onClick={handleInitialize}
            disabled={isDisabled}
            style={{
              ...buttonPrimary,
              ...(isDisabled ? buttonDisabled : {}),
            }}
          >
            {isLoadingYears ? 'Lade Jahre...' : isInitializing ? 'Lädt...' : 'Daten laden'}
          </button>

          {error && <div style={errorMessage}>{error}</div>}
        </div>
      )}

      {isInitialized && (
        <div>
          <div style={successMessage}>
            Daten für {year} erfolgreich geladen!
          </div>

          <div style={cardStyle}>
            <MoonPhaseSuccessChart year={year} />
          </div>

          <div style={cardStyle}>
            <LaunchStatusChart year={year} />
          </div>

          <div style={cardStyle}>
            <LaunchTimelineChart year={year} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={() => setIsInitialized(false)} style={buttonSecondary}>
              Anderes Jahr laden
            </button>
          </div>
        </div>
      )}

      <footer style={footerStyle}>
        <p>Schulprojekt 2025 - Raketen & Mondphasen Analyse</p>
      </footer>
    </div>
  );
}

export default App;
