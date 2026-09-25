import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";

// ── Animated number counter hook ──────────────────────────────
function useCountUp(target: number, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    let startTime: number | null = null;
    const timer = setTimeout(() => {
      const step = (ts: number) => {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration, delay]);
  return count;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  iconBg: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, gradient, iconBg, delay }) => {
  const displayValue = useCountUp(value, 1000, delay * 1000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.93 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -7, scale: 1.02, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } }}
      className="group h-full"
    >
      <Card className="relative overflow-hidden border border-white/60 bg-white/70 backdrop-blur-xl shadow-md hover:shadow-2xl hover:shadow-primary/10 transition-all duration-400 h-full">
        {/* Animated gradient left strip */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
          style={{ background: gradient }}
          initial={{ scaleY: 0, originY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.6, delay: delay + 0.1, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Shimmer streak on hover */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />

        {/* Soft glow blob */}
        <div
          className="absolute -right-6 -top-6 w-20 h-20 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
          style={{ background: gradient }}
        />

        <CardContent className="p-6 pl-6 flex flex-col h-full">
          {/* Top area: label + value + icon */}
          <div className="flex items-start justify-between gap-3 flex-1">
            <div className="space-y-2 min-w-0">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.12em] leading-tight">{label}</p>
              <div className="flex items-baseline gap-1.5">
                <motion.h3
                  className="text-4xl font-black tracking-tight tabular-nums"
                  style={{ background: gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                  {displayValue}
                </motion.h3>
              </div>
            </div>

            {/* Icon with animated glow ring */}
            <div className="relative shrink-0">
              <div
                className="absolute inset-0 rounded-2xl blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                style={{ background: gradient }}
              />
              <div
                className={`relative p-3 rounded-2xl ${iconBg} text-white group-hover:scale-110 transition-transform duration-300`}
                style={{ background: gradient }}
              >
                {icon}
              </div>
            </div>
          </div>

          {/* Animated thin progress bar — always pinned to bottom */}
          <div className="mt-4 h-[3px] rounded-full bg-black/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: gradient }}
              initial={{ width: 0 }}
              animate={{ width: value > 0 ? "75%" : "10%" }}
              transition={{ duration: 1, delay: delay + 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </CardContent>

      </Card>
    </motion.div>
  );
};

interface DashboardStatsProps {
  status: Record<string, number>;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ status }) => {
  const { t } = useLanguage();

  const stats = [
    {
      label: "Total Tickets",
      value: Object.values(status).reduce((a, b) => a + b, 0),
      icon: <FileText className="w-5 h-5 text-white" />,
      color: "bg-blue-500",
      iconBg: "bg-blue-500",
      gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)",
      delay: 0.1,
    },
    {
      label: "Open Tickets",
      value: status["OPEN"] || 0,
      icon: <Clock className="w-5 h-5 text-white" />,
      color: "bg-amber-500",
      iconBg: "bg-amber-500",
      gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
      delay: 0.2,
    },
    {
      label: "In Progress",
      value: status["IN_PROGRESS"] || 0,
      icon: <CheckCircle2 className="w-5 h-5 text-white" />,
      color: "bg-emerald-500",
      iconBg: "bg-emerald-500",
      gradient: "linear-gradient(135deg, #10b981, #34d399)",
      delay: 0.3,
    },
    {
      label: "Closed Tickets",
      value: status["CLOSED"] || 0,
      icon: <AlertCircle className="w-5 h-5 text-white" />,
      color: "bg-rose-500",
      iconBg: "bg-rose-500",
      gradient: "linear-gradient(135deg, #8b5cf6, #c084fc)",
      delay: 0.4,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;
