import React, { useEffect, useState } from "react";
import Layout from "@/components/layout/layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDashboardData } from "@/services/api/dashboard";
import { getDepartments } from "@/services/api/departments";
import PieChartCard from "./components/PieChartCard";
import BarChartCard from "./components/BarChartCard";
import DashboardStats from "./components/DashboardStats";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, LayoutDashboard } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

interface Department {
  id: number | string;
  name: string;
}

interface DashboardData {
  pieChart: { name: string; value: number; fill: string }[];
  barChart: { name: string; value: number; fill: string }[];
  documentStatus: Record<string, number>;
  canViewAll: boolean;
}

const DashboardLayout: React.FC = () => {
  const { t } = useLanguage();
  const authUser = useSelector((state: RootState) => state.authUser?.user);
  const isQA =
    authUser?.departments?.includes("QA") ||
    authUser?.departments?.includes("Quality Assurance");

  const [data, setData] = useState<DashboardData | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDepartment]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const result = await getDashboardData(selectedDepartment);
      setData(result);

      if (departments.length === 0) {
        fetchDepartments();
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments(1, 100);
      setDepartments(res.departments);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const handleFilterChange = (value: string) => {
    setSelectedDepartment(value);
  };

  if (loading && !data) {
    return (
      <Layout title={t("dashboard.title")}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-6">
          {/* Header skeleton */}
          <div className="flex items-center gap-4">
            <div className="skeleton w-12 h-12 rounded-2xl" />
            <div className="space-y-2">
              <div className="skeleton w-56 h-7 rounded-lg" />
              <div className="skeleton w-40 h-4 rounded-lg" />
            </div>
          </div>
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="skeleton h-28 rounded-2xl"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div
              className="skeleton h-80 rounded-2xl"
              style={{ animationDelay: "200ms" }}
            />
            <div
              className="skeleton h-80 rounded-2xl"
              style={{ animationDelay: "350ms" }}
            />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t("dashboard.title")}>
      <div className="relative min-h-screen pb-12">
        {/* Background Decorative Accents */}
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-6"
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <LayoutDashboard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground font-modern">
                  {t("dashboard.monitoring")}
                </h2>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  {t("dashboard.liveDescription")}
                </p>
              </div>
            </div>

            {
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="hidden sm:flex items-center text-sm text-muted-foreground mr-2">
                  <Filter className="w-4 h-4 mr-2" />
                  {t("dashboard.filterBy")}
                </div>
                <div className="w-full md:w-[250px]">
                  <Select
                    value={selectedDepartment}
                    onValueChange={handleFilterChange}
                  >
                    <SelectTrigger className="bg-white/50 backdrop-blur-md border-primary/20 hover:border-primary/40 transition-all rounded-xl h-11">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-xl bg-white/90 border-primary/20">
                      <SelectItem
                        value="all"
                        className="hover:bg-primary/10 rounded-lg mx-1 my-0.5"
                      >
                        {t("dashboard.allDepartments")}
                      </SelectItem>
                      {departments.map((dept) => (
                        <SelectItem
                          key={dept.id}
                          value={dept.id.toString()}
                          className="hover:bg-primary/10 rounded-lg mx-1 my-0.5"
                        >
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            }
          </div>

          <AnimatePresence mode="wait">
            {!loading && data && (
              <motion.div
                key={selectedDepartment}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <DashboardStats status={data.documentStatus} />

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <PieChartCard
                      title="Tickets by Category"
                      description="Distribution of ticket categories"
                      data={data.pieChart}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <BarChartCard
                      title="Tickets Volume (Weekly)"
                      description="Tickets opened over the week"
                      data={data.barChart}
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-[500px] space-y-4"
            >
              <div className="modern-spinner" />
              <p className="text-muted-foreground animate-pulse text-sm">
                {t("dashboard.synchronizing")}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default DashboardLayout;
