import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { motion } from "framer-motion";
import { PieChart } from "lucide-react";

interface PieChartItem {
  name: string;
  value: number;
  fill?: string;
}

interface PieChartCardProps {
  title: string;
  description?: string;
  data: PieChartItem[];
  colors?: string[];
  height?: string;
}

// Default color mapping by name
const defaultColorMap: Record<string, string> = {
  internal: "#3b82f6",
  external: "#f97316",
};

const resolveColor = (name: string, fill?: string): string => {
  const lower = name.toLowerCase();
  for (const [key, color] of Object.entries(defaultColorMap)) {
    if (lower.includes(key)) return color;
  }
  return fill || "#8884d8";
};

const PieChartCard: React.FC<PieChartCardProps> = ({
  title,
  description,
  data,
  colors,
  height = "350px",
}) => {
  const series = data.map((d) => d.value);
  const labels = data.map((d) => d.name);
  const resolvedColors = colors || data.map((d) => resolveColor(d.name, d.fill));

  const options: ApexOptions = {
    chart: {
      type: "pie",
      toolbar: { show: true },
      animations: {
        enabled: true,
        speed: 900,
        animateGradually: { enabled: true, delay: 150 },
        dynamicAnimation: { enabled: true, speed: 500 },
      },
    },
    labels,
    colors: resolvedColors,
    stroke: { width: 2, colors: ["#fff"] },
    legend: {
      position: "bottom",
      onItemClick: { toggleDataSeries: true },
      onItemHover: { highlightDataSeries: true },
      formatter: (legendName: string, opts?: any) => {
        const idx = opts?.seriesIndex ?? 0;
        return `${legendName}: ${series[idx]}`;
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (_val: number, opts: any) => {
        const count = series[opts.seriesIndex];
        return count.toString();
      },
      style: { fontSize: "14px", fontWeight: 600 },
      dropShadow: { enabled: true, blur: 3, opacity: 0.2 },
    },
    tooltip: { y: { formatter: (val: number) => `${val} Documents` } },
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: { size: "0%" },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="group"
    >
      <Card className="relative overflow-hidden border border-white/60 bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:shadow-primary/8 transition-all duration-500">
        {/* Top gradient strip */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-xl" />

        {/* Soft radial glow in corner */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl group-hover:bg-blue-400/20 transition-colors duration-700" />

        <CardHeader className="pb-2 pt-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10">
                  <PieChart className="w-4 h-4 text-blue-600" />
                </div>
                <CardTitle className="text-base font-bold tracking-tight font-modern text-foreground">{title}</CardTitle>
              </div>
              {description && <CardDescription className="text-xs text-muted-foreground/80 ml-9">{description}</CardDescription>}
            </div>
            {/* Live pulse dot */}
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-3">
          <div
            style={{ height }}
            className="w-full transition-transform duration-500 group-hover:scale-[1.02]"
          >
            <Chart
              options={options}
              series={series}
              type="pie"
              height="100%"
              width="100%"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PieChartCard;
