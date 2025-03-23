'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsTrendChartProps {
  data: Array<{
    month: string;
    value: number;
  }>;
  title: string;
  percentageChange: number;
  valuePrefix?: string;
}

export function StatsTrendChart({ data, title, percentageChange, valuePrefix = '' }: StatsTrendChartProps) {
  const isPositive = percentageChange >= 0;
  
  // Define colors for positive and negative trends
  const colors = {
    positive: {
      stroke: "#16a34a",
      fill: "rgba(22, 163, 74, 0.1)" // Light green with opacity
    },
    negative: {
      stroke: "#dc2626",
      fill: "rgba(220, 38, 38, 0.1)" // Light red with opacity
    }
  };

  const currentColors = isPositive ? colors.positive : colors.negative;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{percentageChange.toFixed(1)}%
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[80px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${isPositive ? 'positive' : 'negative'}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={currentColors.fill} stopOpacity={1} />
                  <stop offset="100%" stopColor={currentColors.fill} stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={currentColors.stroke}
                strokeWidth={2}
                fill={`url(#gradient-${isPositive ? 'positive' : 'negative'})`}
                dot={false}
              />
              <XAxis
                dataKey="month"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {payload[0].payload.month}
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {valuePrefix}{payload[0].value}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 