import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { chartApi } from '../services/chartApi';
import type { LaunchTimelinePoint } from '../types/chart.types';

/**
 * Chart 3: LineChart - Anzahl Starts pro Monat
 */
export const LaunchTimelineChart: React.FC<{ year: number }> = ({ year }) => {
  const [data, setData] = useState<LaunchTimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [year]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await chartApi.getLaunchTimeline(year);
      setData(result.data);
      setError(null);
    } catch (err) {
      setError('Fehler beim Laden der Daten');
      console.error('Error fetching launch timeline data:', err);
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
            {data.month} {year}
          </p>
          <p style={{ margin: '4px 0', color: '#8b5cf6' }}>
            Anzahl Starts: {data.launchCount}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Lädt Timeline-Daten...
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
        Raketen-Starts pro Monat ({year})
      </h2>
      <ResponsiveContainer width="100%" height={400} style={{ maxWidth: '100%' }}>
        <LineChart 
          data={data}
          margin={{ top: 5, right: 60, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month"
            style={{ fontSize: '14px' }}
          />
          <YAxis
            label={{ value: 'Anzahl Starts', angle: -90, position: 'insideLeft' }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="launchCount"
            stroke="#8b5cf6"
            strokeWidth={2}
            name="Anzahl Starts"
            dot={{ fill: '#8b5cf6', r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};