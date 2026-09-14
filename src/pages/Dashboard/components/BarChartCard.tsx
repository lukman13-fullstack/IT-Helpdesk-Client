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
import { BarChart3 } from "lucide-react";

interface BarChartItem {
  name: string;
  value: number;
  fill?: string;
}

interface BarChartCardProps {
  title: string;
  description?: string;
  data: BarChartItem[];
  seriesName?: string;
  colors?: string[];
  colorMap?: Record<string, string>;
  height?: string;
}

// Default color mapping by category name
const defaultColorMap: Record<string, string> = {
  "Manual Company": "#f97316",
  "Manual Halal": "#991b1b",
  "Procedure": "#22c55e",
  "Standard": "#2563eb",
  "Work Instruction": "#7e22ce",
  "Form": "#b45309",
};

const resolveBarColor = (
  name: string,
  colorMap: Record<string, string>,
  fill?: string
): string => {
  if (colorMap[name]) return colorMap[name];
  const lower = name.toLowerCase();
  for (const [key, color] of Object.entries(colorMap)) {
    if (lower.includes(key.toLowerCase())) return color;
  }
  return fill || "#8884d8";
};

const BarChartCard: React.FC<BarChartCardProps> = ({
  title,
  description,
  data,
  seriesName = "Total Document",
  colors,
  colorMap,
  height = "350px",
}) => {
  const categories = data.map((d) => d.name);
  const values = data.map((d) => d.value);
  const mergedColorMap = { ...defaultColorMap, ...colorMap };
  const resolvedColors =
    colors || data.map((d) => resolveBarColor(d.name, mergedColorMap, d.fill));

  const series = [{ name: seriesName, data: values }];
  const maxVal = Math.max(...values, 1);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: true },
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: { enabled: true, delay: 100 },
        dynamicAnimation: { enabled: true, speed: 400 },
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        borderRadiusApplication: "end",
        horizontal: false,
        columnWidth: "52%",
        distributed: true,
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val.toString(),
      style: { fontSize: "14px", fontWeight: 600, colors: ["#555"] },
      offsetY: -20,
    },
    xaxis: {
      categories,
      labels: {
        style: { fontSize: "14px", fontWeight: 500 },
        rotate: -45,
        rotateAlways: categories.length > 4,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: maxVal <= 5 ? maxVal + 2 : undefined,
      forceNiceScale: true,
      labels: {
        formatter: (val: number) => Math.round(val).toString(),
        style: { fontSize: "14px" },
      },
      title: {
        text: "Total Document",
        style: { fontSize: "14px", fontWeight: 600 },
      },
    },
    colors: resolvedColors,
    legend: { position: "bottom" },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 5,
      xaxis: { lines: { show: false } },
      padding: { bottom: 15 },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.4,
        opacityFrom: 1,
        opacityTo: 0.75,
        stops: [0, 95],
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="group"
    >
      <Card className="relative overflow-hidden border border-white/60 bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:shadow-primary/8 transition-all duration-500">
        {/* Top gradient strip */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-t-xl" />

        {/* Soft glow corner */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl group-hover:bg-emerald-400/20 transition-colors duration-700" />

        <CardHeader className="pb-2 pt-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                </div>
                <CardTitle className="text-base font-bold tracking-tight font-modern text-foreground">
                  {title}
                </CardTitle>
              </div>
              {description && (
                <CardDescription className="text-xs text-muted-foreground/80 ml-9">
                  {description}
                </CardDescription>
              )}
            </div>
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-3">
          <div
            style={{ height }}
            className="w-full transition-transform duration-500 group-hover:scale-[1.01]"
          >
            <Chart
              options={options}
              series={series}
              type="bar"
              height="100%"
              width="100%"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BarChartCard;
