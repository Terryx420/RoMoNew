import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { chartApi } from '../services/chartApi';
import type { LaunchStatusDistribution } from '../types/chart.types';
import { chartContainer, chartTitle, colors } from '../styles';
import { ChartState } from './ChartState';
import { ChartTooltip, TooltipTitle, TooltipRow } from './ChartTooltip';

const STATUS_COLORS: Record<string, string> = {
  'Success': colors.chart.success,
  'Failure': colors.chart.failure,
  'Partial Success': colors.chart.partialSuccess,
  'TBD': colors.chart.tbd,
};

export const LaunchStatusChart: React.FC<{ year: number }> = ({ year }) => {
  const [data, setData] = useState<LaunchStatusDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await chartApi.getLaunchStatus(year);
        setData(result.data);
        setError(null);
      } catch {
        setError('Fehler beim Laden der Daten');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  const stateEl = (
    <ChartState
      loading={loading}
      error={error}
      isEmpty={!data.length}
      year={year}
      loadingText="Lädt Status-Daten..."
    />
  );

  if (loading || error || !data.length) return stateEl;

  return (
    <div style={chartContainer}>
      <h2 style={chartTitle}>Launch-Status Verteilung ({year})</h2>
      <ResponsiveContainer width="100%" height={400}>
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
              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#8884d8'} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => (
              <ChartTooltip active={active} payload={payload}>
                {(d: LaunchStatusDistribution) => (
                  <>
                    <TooltipTitle>{d.status}</TooltipTitle>
                    <TooltipRow>Anzahl: {d.count}</TooltipRow>
                    <TooltipRow color={colors.gray}>Anteil: {d.percentage}%</TooltipRow>
                  </>
                )}
              </ChartTooltip>
            )}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
