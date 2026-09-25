import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import type { RootState } from "@/store";
import { asyncSetAuthUser } from "@/store/authUser/action";
import Lottie from "lottie-react";
import ITDealAnim from "@/assets/lottie/Cute Bot Say Users Hello.json";

import { useLanguage } from "@/context/LanguageContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const dispatch = useAppDispatch();
  const error = useAppSelector((state: RootState) => state.authUser.error);
  const { t } = useLanguage();



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await dispatch(asyncSetAuthUser({ username, password }));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };

  return (
    <div className="relative flex flex-col md:flex-row-reverse min-h-screen overflow-hidden items-center justify-center p-4 gap-8 md:gap-16 bg-slate-50 dark:bg-slate-950">
      {/* Modern Hacker / IT Cyber Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 md:opacity-60">
        {/* Cyber Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, color-mix(in srgb, var(--primary) 10%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--primary) 10%, transparent) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            maskImage:
              "radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 100%)",
          }}
        />

        {/* Sweeping Cyber Scanner */}
        <motion.div
          animate={{ top: ["-10%", "110%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[2px] bg-primary/50 shadow-[0_0_15px_rgba(37,99,235,0.8)]"
        />

        {/* Floating Data Nodes (Binary & Tech symbols) */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`tech-node-${i}`}
            className="absolute font-mono text-primary/40 text-xs md:text-sm font-bold"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              y: [0, -20],
            }}
            transition={{
              duration: Math.random() * 2 + 2,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          >
            {Math.random() > 0.7
              ? "< />"
              : Math.random() > 0.4
                ? "0101"
                : "IT-SYS"}
          </motion.div>
        ))}

        {/* Moving Data Packets on Grid */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`packet-${i}`}
            className="absolute bg-primary/60 shadow-[0_0_8px_rgba(37,99,235,0.6)]"
            style={{
              top: `${Math.floor(Math.random() * 20) * 40}px`,
              height: "2px",
              width: "40px",
              left: "-40px",
            }}
            animate={{ left: ["-5%", "105%"] }}
            transition={{
              duration: Math.random() * 3 + 4,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>

      {/* Lottie hero */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[280px] md:max-w-lg lg:max-w-xl hidden sm:block relative z-10"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Lottie
            animationData={ITDealAnim}
            style={{ width: "100%", height: "auto" }}
            className="md:ml-10 mix-blend-multiply"
          />
        </motion.div>
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="w-full max-w-md relative z-10"
      >
        <title>Login</title>
        <Card
          className="border-primary/20 shadow-2xl shadow-primary/10 glass-card"
          style={{ borderRadius: "1.25rem" }}
        >
          <CardHeader className="space-y-1 pb-2">
            <motion.div
              className="flex items-center justify-center mb-3"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-primary-foreground font-bold text-xl">
                  IT
                </span>
              </div>
            </motion.div>
            <CardTitle className="text-2xl text-center">IT Helpdesk</CardTitle>
            <CardDescription className="text-center">
              {t("login.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
            <form onSubmit={handleSubmit}>
              <motion.div
                className="grid gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div className="grid gap-2" variants={itemVariants}>
                  <Label htmlFor="username">{t("login.username")}</Label>
                  <Input
                    id="username"
                    placeholder={t("login.usernamePlaceholder")}
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setUsername(e.target.value)
                    }
                    required
                    autoComplete="username"
                    className="h-11 rounded-xl transition-all duration-300 hover:border-primary/40"
                  />
                </motion.div>
                <motion.div className="grid gap-2" variants={itemVariants}>
                  <Label htmlFor="password">{t("login.password")}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={isShowPassword ? "text" : "password"}
                      placeholder={t("login.passwordPlaceholder")}
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target.value)
                      }
                      required
                      autoComplete="current-password"
                      className="h-11 rounded-xl transition-all duration-300 hover:border-primary/40 pr-10"
                    />
                    <button
                      type="button"
                      onClick={handleShowPassword}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      {isShowPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 font-semibold text-[15px]"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("login.loggingIn")}
                      </>
                    ) : (
                      t("login.loginButton")
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          </CardContent>
        </Card>
        {/* Subtle glow under card */}
        <div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, color-mix(in srgb, var(--primary) 15%, transparent), transparent 80%)",
            filter: "blur(12px)",
          }}
        />
      </motion.div>
    </div>
  );
}
