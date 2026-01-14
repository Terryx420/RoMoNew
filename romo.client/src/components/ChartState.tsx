import { centeredText, errorState } from '../styles';

interface ChartStateProps {
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  year: number;
  loadingText: string;
}

/**
 * Zeigt Loading/Error/Empty-States für Charts
 */
export const ChartState = ({ loading, error, isEmpty, year, loadingText }: ChartStateProps) => {
  if (loading) {
    return <div style={centeredText}>{loadingText}</div>;
  }

  if (error) {
    return <div style={errorState}>{error}</div>;
  }

  if (isEmpty) {
    return <div style={centeredText}>Keine Daten für {year} verfügbar</div>;
  }

  return null;
};
