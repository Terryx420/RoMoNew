import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { chartApi } from '../services/chartApi';
import type { LaunchTimelinePoint } from '../types/chart.types';
import { chartContainer, chartTitle, colors, fontSize } from '../styles';
import { ChartState } from './ChartState';
import { ChartTooltip, TooltipTitle, TooltipRow } from './ChartTooltip';

export const LaunchTimelineChart: React.FC<{ year: number }> = ({ year }) => {
  const [data, setData] = useState<LaunchTimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await chartApi.getLaunchTimeline(year);
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
      loadingText="Lädt Timeline-Daten..."
    />
  );

  if (loading || error || !data.length) return stateEl;

  return (
    <div style={chartContainer}>
      <h2 style={chartTitle}>Raketen-Starts pro Monat ({year})</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 60, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" style={{ fontSize: fontSize.sm }} />
          <YAxis
            label={{ value: 'Anzahl Starts', angle: -90, position: 'insideLeft' }}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload }) => (
              <ChartTooltip active={active} payload={payload}>
                {(d: LaunchTimelinePoint) => (
                  <>
                    <TooltipTitle>{d.month} {year}</TooltipTitle>
                    <TooltipRow color={colors.chart.line}>
                      Anzahl Starts: {d.launchCount}
                    </TooltipRow>
                  </>
                )}
              </ChartTooltip>
            )}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="launchCount"
            stroke={colors.chart.line}
            strokeWidth={2}
            name="Anzahl Starts"
            dot={{ fill: colors.chart.line, r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
