import type { ReactNode } from 'react';
import { tooltipStyle, tooltipTitle, tooltipText, colors } from '../styles';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface TooltipProps {
  active?: boolean;
  payload?: any[];
  children: (data: any) => ReactNode;
}

/**
 * Wiederverwendbarer Tooltip-Wrapper für alle Charts
 */
export const ChartTooltip = ({ active, payload, children }: TooltipProps) => {
  if (!active || !payload?.length || !payload[0]?.payload) return null;

  return (
    <div style={tooltipStyle}>
      {children(payload[0].payload)}
    </div>
  );
};

/** Tooltip-Komponenten für konsistentes Styling */
export const TooltipTitle = ({ children }: { children: ReactNode }) => (
  <p style={tooltipTitle}>{children}</p>
);

export const TooltipRow = ({ children, color }: { children: ReactNode; color?: string }) => (
  <p style={{ ...tooltipText, color: color || 'inherit' }}>{children}</p>
);

export const TooltipSmall = ({ children }: { children: ReactNode }) => (
  <p style={{ ...tooltipText, fontSize: '12px', color: colors.gray }}>{children}</p>
);
