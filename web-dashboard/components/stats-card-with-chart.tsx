'use client';

import { useState } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { StatsTrendChart } from '@/components/stats-trend-chart';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * StatsCardWithChart component props interface
 */
interface StatsCardWithChartProps {
  title: string;
  value: string;
  link?: string | null;
  chartData?: {
    data: Array<{ month: string; value: number }>;
    percentageChange: number;
  };
  valuePrefix?: string;
}

/**
 * StatsCardWithChart component
 * Displays a statistic with an optional hover-triggered trend chart
 * 
 * @param title - Title of the statistic
 * @param value - Value to display
 * @param link - Optional link to navigate to when clicked
 * @param chartData - Optional data for the trend chart
 * @param valuePrefix - Optional prefix for values (e.g., "$")
 */
export function StatsCardWithChart({ 
  title, 
  value, 
  link, 
  chartData,
  valuePrefix 
}: StatsCardWithChartProps) {
  const [showChart, setShowChart] = useState(false);

  const cardContent = (
    <CardContent className="p-4 sm:p-6">
      <CardTitle className="text-xs sm:text-sm font-medium text-[#6B46C1]">{title}</CardTitle>
      <div className="text-xl sm:text-2xl font-bold mt-2">{value}</div>
    </CardContent>
  );

  return (
    <div className="relative">
      <Card
        className={`${link ? "cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105" : ""}`}
        onMouseEnter={() => chartData && setShowChart(true)}
        onMouseLeave={() => setShowChart(false)}
      >
        {link ? (
          <Link href={link}>
            {cardContent}
          </Link>
        ) : (
          cardContent
        )}
      </Card>

      <AnimatePresence>
        {showChart && chartData && (
          <motion.div 
            className="absolute z-10 w-full mt-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <StatsTrendChart
              title={title}
              data={chartData.data}
              percentageChange={chartData.percentageChange}
              valuePrefix={valuePrefix}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 