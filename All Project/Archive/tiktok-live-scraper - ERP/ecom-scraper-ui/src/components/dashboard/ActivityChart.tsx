import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '../ui/Card';

interface ActivityData {
  time: string;
  tiktok: number;
  shopee: number;
  lazada: number;
}

interface ActivityChartProps {
  data: ActivityData[];
  title?: string;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({
  data,
  title = 'Scraping Activity (Last 24 Hours)',
}) => {
  return (
    <Card className="p-6 h-[400px]">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      <div className="h-full w-full pb-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Line
              type="monotone"
              dataKey="tiktok"
              stroke="#FE2C55" // tiktok pink
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              name="TikTok"
            />
            <Line
              type="monotone"
              dataKey="shopee"
              stroke="#EE4D2D" // shopee orange
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              name="Shopee"
            />
            <Line
              type="monotone"
              dataKey="lazada"
              stroke="#0F146D" // lazada blue
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              name="Lazada"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
