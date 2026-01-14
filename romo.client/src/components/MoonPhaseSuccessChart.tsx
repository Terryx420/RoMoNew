import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { chartApi } from '../services/chartApi';
import type { MoonPhaseSuccessRate } from '../types/chart.types';
import { chartContainer, chartTitle, colors, fontSize } from '../styles';
import { ChartState } from './ChartState';
import { ChartTooltip, TooltipTitle, TooltipRow, TooltipSmall } from './ChartTooltip';

export const MoonPhaseSuccessChart: React.FC<{ year: number }> = ({ year }) => {
  const [data, setData] = useState<MoonPhaseSuccessRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await chartApi.getMoonPhaseSuccess(year);
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
      loadingText="Lädt Mondphasen-Daten..."
    />
  );

  if (loading || error || !data.length) return stateEl;

  return (
    <div style={chartContainer}>
      <h2 style={chartTitle}>Erfolgsrate nach Mondphase ({year})</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="moonPhase" style={{ fontSize: fontSize.sm }} />
          <YAxis
            label={{ value: 'Erfolgsrate (%)', angle: -90, position: 'insideLeft' }}
            domain={[0, 100]}
          />
          <Tooltip
            content={({ active, payload }) => (
              <ChartTooltip active={active} payload={payload}>
                {(d: MoonPhaseSuccessRate) => (
                  <>
                    <TooltipTitle>{d.moonPhase}</TooltipTitle>
                    <TooltipRow color={colors.chart.bar}>Erfolgsrate: {d.successRate}%</TooltipRow>
                    <TooltipSmall>
                      Erfolgreich: {d.successfulLaunches} / {d.totalLaunches}
                    </TooltipSmall>
                  </>
                )}
              </ChartTooltip>
            )}
          />
          <Legend />
          <Bar
            dataKey="successRate"
            fill={colors.chart.bar}
            name="Erfolgsrate"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
