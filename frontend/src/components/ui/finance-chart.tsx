import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export type ChartType = 'line' | 'bar' | 'area' | 'pie';

interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

interface FinanceChartProps {
  data: ChartDataPoint[];
  type?: ChartType;
  title?: string;
  description?: string;
  dataKey?: string;
  xAxisKey?: string;
  categoryColor?: string;
  height?: number;
  className?: string;
  formatValue?: (value: number) => string;
  showGrid?: boolean;
  showLegend?: boolean;
  additionalLines?: {
    dataKey: string;
    color: string;
    name: string;
  }[];
}

const COLORS = [
  'hsl(173 80% 40%)',
  'hsl(35 85% 55%)',
  'hsl(145 70% 45%)',
  'hsl(262 80% 50%)',
  'hsl(10 80% 50%)',
];

export const FinanceChart = ({
  data,
  type = 'line',
  title,
  description,
  dataKey = 'value',
  xAxisKey = 'name',
  categoryColor = '35 85% 55%',
  height = 300,
  className,
  formatValue = (value) => `₹${value.toLocaleString()}`,
  showGrid = true,
  showLegend = true,
  additionalLines = [],
}: FinanceChartProps) => {
  const mainColor = `hsl(${categoryColor})`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatValue(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatValue} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Bar dataKey={dataKey} fill={mainColor} radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length] || mainColor}
                />
              ))}
            </Bar>
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatValue} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={mainColor}
              fill={mainColor}
              fillOpacity={0.2}
              strokeWidth={2}
            />
            {additionalLines.map((line, index) => (
              <Area
                key={index}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                fill={line.color}
                fillOpacity={0.1}
                strokeWidth={2}
                name={line.name}
              />
            ))}
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${formatValue(entry.value)}`}
              outerRadius={80}
              fill={mainColor}
              dataKey={dataKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
          </PieChart>
        );

      case 'line':
      default:
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatValue} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={mainColor}
              strokeWidth={3}
              dot={{ fill: mainColor, r: 4 }}
              activeDot={{ r: 6 }}
            />
            {additionalLines.map((line, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                strokeWidth={2}
                dot={{ fill: line.color, r: 3 }}
                name={line.name}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-xl border border-border bg-card p-6 shadow-lg', className)}
    >
      {(title || description) && (
        <div className="mb-6">
          {title && <h3 className="text-lg font-semibold mb-1">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </motion.div>
  );
};

// Utility function to generate time-series data for lumpsum/SIP growth
export const generateGrowthData = (
  principal: number,
  rate: number,
  years: number,
  sip?: number
): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const monthlyRate = rate / 12 / 100;

  for (let year = 0; year <= years; year++) {
    const months = year * 12;

    // Lumpsum calculation
    const lumpsumValue = principal * Math.pow(1 + monthlyRate, months);

    // SIP calculation (if provided)
    let sipValue = 0;
    if (sip) {
      sipValue =
        sip *
        (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    }

    data.push({
      name: `Year ${year}`,
      year,
      lumpsum: Math.round(lumpsumValue),
      ...(sip && { sip: Math.round(sipValue) }),
    });
  }

  return data;
};

// Utility function for EMI payment breakdown over time
export const generateEMIData = (
  principal: number,
  monthlyRate: number,
  months: number
): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  let balance = principal;

  for (let month = 1; month <= Math.min(months, 60); month += months > 60 ? 12 : 1) {
    const interestPaid = balance * monthlyRate;
    const principalPaid = emi - interestPaid;
    balance -= principalPaid;

    data.push({
      name: months > 60 ? `Year ${Math.ceil(month / 12)}` : `Month ${month}`,
      principal: Math.round(principalPaid),
      interest: Math.round(interestPaid),
      balance: Math.round(Math.max(0, balance)),
    });
  }

  return data;
};

// Utility function for pie chart data
export const generatePieData = (items: { label: string; value: number }[]): ChartDataPoint[] => {
  return items.map((item) => ({
    name: item.label,
    value: item.value,
  }));
};
