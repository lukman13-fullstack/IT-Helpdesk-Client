import { useNavigate } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { Shield, User, ArrowRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { asyncLogout } from "@/store/authUser/action";

export default function RoleSelection() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.authUser.user);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, color-mix(in srgb, var(--primary) 10%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--primary) 10%, transparent) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 100%)",
          }}
        />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            Welcome back, {user?.username || "Super Admin"}
          </h1>
          <p className="text-muted-foreground text-lg">
            Please select the workspace you want to access
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-6"
        >
          {/* CMS Card */}
          <motion.div variants={itemVariants}>
            <div 
              onClick={() => navigate("/dashboard")}
              className="group relative flex flex-col h-full bg-card rounded-3xl border border-primary/10 p-8 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Settings className="w-7 h-7" />
                </div>
                
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Administration
                </h2>
                <p className="text-muted-foreground mb-8 flex-1">
                  Access the Content Management System (CMS) to manage tickets, users, roles, departments, and system settings.
                </p>
                
                <div className="mt-auto flex items-center text-primary font-semibold">
                  <span className="group-hover:mr-2 transition-all duration-300">Enter CMS</span>
                  <ArrowRight className="w-5 h-5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* User Portal Card */}
          <motion.div variants={itemVariants}>
            <div 
              onClick={() => navigate("/portal")}
              className="group relative flex flex-col h-full bg-card rounded-3xl border border-blue-500/10 p-8 shadow-lg hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                  <User className="w-7 h-7" />
                </div>
                
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  User Portal
                </h2>
                <p className="text-muted-foreground mb-8 flex-1">
                  Access the standard user workspace to view your personal tickets, submit new requests, and interact with the helpdesk.
                </p>
                
                <div className="mt-auto flex items-center text-blue-500 font-semibold">
                  <span className="group-hover:mr-2 transition-all duration-300">Enter Portal</span>
                  <ArrowRight className="w-5 h-5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mt-12 text-center"
        >
          <Button
            variant="ghost"
            onClick={() => {
              dispatch(asyncLogout());
              navigate("/login");
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
