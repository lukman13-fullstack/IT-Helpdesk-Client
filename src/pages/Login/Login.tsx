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
import DocHero from "@/assets/lottie/DocHero.json";
import { THEME_PRESETS, applyThemeToDocument } from "@/lib/theme-utils";
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
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
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

  useEffect(() => {
    const defaultTheme = THEME_PRESETS.find((t) => t.name === "Forest Green");
    if (defaultTheme) {
      applyThemeToDocument(defaultTheme);
    }
  }, []);

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
    <div className="relative flex min-h-screen max-h-screen overflow-hidden items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, var(--background) 0%, color-mix(in srgb, var(--muted) 50%, var(--background)) 50%, var(--background) 100%)" }}
    >
      {/* Animated background orbs */}
      <motion.div
        className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--primary) 8%, transparent), transparent 70%)" }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--secondary) 10%, transparent), transparent 70%)" }}
        animate={{ x: [0, -25, 0], y: [0, 15, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[40%] right-[20%] w-[250px] h-[250px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 6%, transparent), transparent 70%)" }}
        animate={{ x: [0, 15, 0], y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Lottie hero */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Lottie
            animationData={DocHero}
            style={{ width: 600, height: 600 }}
            className="mr-10"
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
        <Card className="border-primary/20 shadow-2xl shadow-primary/10 glass-card"
          style={{ borderRadius: "1.25rem" }}
        >
          <CardHeader className="space-y-1 pb-2">
            <motion.div
              className="flex items-center justify-center mb-3"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-primary-foreground font-bold text-2xl">
                  D
                </span>
              </div>
            </motion.div>
            <CardTitle className="text-2xl text-center">DMS QA</CardTitle>
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
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
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
            background: "radial-gradient(ellipse, color-mix(in srgb, var(--primary) 15%, transparent), transparent 80%)",
            filter: "blur(12px)",
          }}
        />
      </motion.div>
    </div>
  );
}

