import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { chartApi } from '../services/chartApi';
import type { MoonPhaseSuccessRate } from '../types/chart.types';

/**
 * Chart 1: BarChart - Erfolgsrate pro Mondphase
 */
export const MoonPhaseSuccessChart: React.FC<{ year: number }> = ({ year }) => {
  const [data, setData] = useState<MoonPhaseSuccessRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [year]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await chartApi.getMoonPhaseSuccess(year);
      setData(result.data);
      setError(null);
    } catch (err) {
      setError('Fehler beim Laden der Daten');
      console.error('Error fetching moon phase success data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Custom Tooltip mit Extra-Infos
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
            {data.moonPhase}
          </p>
          <p style={{ margin: '4px 0', color: '#2563eb' }}>
            Erfolgsrate: {data.successRate}%
          </p>
          <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
            Erfolgreich: {data.successfulLaunches} / {data.totalLaunches}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Lädt Mondphasen-Daten...
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
        Erfolgsrate nach Mondphase ({year})
      </h2>
      <ResponsiveContainer width="100%" height={400} style={{ maxWidth: '100%' }}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="moonPhase"
            style={{ fontSize: '14px' }}
          />
          <YAxis
            label={{ value: 'Erfolgsrate (%)', angle: -90, position: 'insideLeft' }}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="successRate"
            fill="#2563eb"
            name="Erfolgsrate"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
