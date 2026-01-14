import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { chartApi } from '../services/chartApi';
import type { LaunchStatusDistribution } from '../types/chart.types';

/**
 * Chart 2: PieChart - Launch-Status Verteilung
 */
export const LaunchStatusChart: React.FC<{ year: number }> = ({ year }) => {
  const [data, setData] = useState<LaunchStatusDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Farben für die verschiedenen Status
  const COLORS: Record<string, string> = {
    'Success': '#10b981',        // Grün
    'Failure': '#ef4444',        // Rot
    'Partial Success': '#f59e0b', // Orange
    'TBD': '#6b7280'             // Grau
  };

  useEffect(() => {
    fetchData();
  }, [year]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await chartApi.getLaunchStatus(year);
      setData(result.data);
      setError(null);
    } catch (err) {
      setError('Fehler beim Laden der Daten');
      console.error('Error fetching launch status data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: '#fff',
          padding: '12px',
          border: '1px solid #ccc',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
            {data.status}
          </p>
          <p style={{ margin: '4px 0' }}>
            Anzahl: {data.count}
          </p>
          <p style={{ margin: '4px 0', color: '#666' }}>
            Anteil: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Lädt Status-Daten...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
        {error}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Keine Daten für {year} verfügbar
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '20px', boxSizing: 'border-box' }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>
        Launch-Status Verteilung ({year})
      </h2>
      <ResponsiveContainer width="100%" height={400} style={{ maxWidth: '100%' }}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={(entry) => `${entry.status}: ${entry.percentage}%`}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.status] || '#8884d8'} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
