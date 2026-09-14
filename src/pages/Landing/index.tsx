import { motion, useScroll, useTransform, useMotionValue, useSpring, Variants, AnimatePresence, animate, useMotionTemplate } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, Shield, CheckCircle, Printer, ArrowRight, BookOpen, Globe, ArrowUp } from "lucide-react";
import { THEME_PRESETS, applyThemeToDocument } from "@/lib/theme-utils";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Lottie from "lottie-react";
import DocHero from "@/assets/lottie/DocHero.json";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Language } from "@/translations";

const TRANSLATIONS = {
  en: {
    title: "Modernize Your",
    titleHighlight: "Document Management System",
    subtitle: "DMS QA is an enterprise-grade Document Management System designed specifically to streamline document control, enhance compliance, and accelerate approval workflows.",
    getStarted: "Get Started",
    login: "Login",
    features: [
      {
        title: "Centralized Control",
        description: "Manage, store, and organize all your quality documents in one secure, easily accessible digital repository."
      },
      {
        title: "Streamlined Approvals",
        description: "Automated routing system to accelerate document review and approval processes across departments."
      },
      {
        title: "Compliance & Security",
        description: "Ensure ISO standards compliance with strict access controls, watermark protection, and detailed audit trails."
      },
      {
        title: "Controlled Printing",
        description: "Monitor and authorize every document printing to prevent unauthorized distribution of confidential information."
      },
      {
        title: "Obsolete Management",
        description: "Automate the withdrawal and archiving of obsolete documents to prevent usage errors."
      }
    ],
    footer1: "PT. Toyo Ink Indonesia.",
    footer2: "All rights reserved."
  },
  id: {
    title: "Modernisasi",
    titleHighlight: "Sistem Manajemen Dokumen",
    subtitle: "DMS QA adalah sistem terpusat berskala enterprise yang dirancang khusus untuk mempermudah pengendalian dokumen, meningkatkan kepatuhan standar mutu, dan mempercepat alur kerja persetujuan secara digital.",
    getStarted: "Mulai Gunakan",
    login: "Masuk",
    features: [
      {
        title: "Kontrol Terpusat",
        description: "Kelola, simpan, dan organisasikan seluruh dokumen mutu dalam satu repositori digital yang aman dan mudah diakses."
      },
      {
        title: "Persetujuan Terintegrasi",
        description: "Sistem routing otomatis untuk mempercepat proses peninjauan dan persetujuan dokumen lintas departemen."
      },
      {
        title: "Kepatuhan & Keamanan",
        description: "Pastikan kepatuhan standar ISO dengan kontrol akses yang ketat, perlindungan watermark, dan jejak audit yang mendetail."
      },
      {
        title: "Pencetakan Terkontrol",
        description: "Pantau dan otorisasi setiap pencetakan dokumen untuk mencegah distribusi informasi rahasia yang tidak sah."
      },
      {
        title: "Manajemen Dokumen Usang",
        description: "Otomatisasi penarikan dan pengarsipan dokumen yang sudah tidak berlaku agar tidak terjadi kesalahan penggunaan."
      }
    ],
    footer1: "PT. Toyo Ink Indonesia.",
    footer2: "Hak cipta dilindungi undang-undang."
  },
  ja: {
    title: "文書管理システムを",
    titleHighlight: "モダナイズする",
    subtitle: "DMS QAは、文書管理の合理化、コンプライアンスの強化、承認ワークフローの加速を目的として設計されたエンタープライズ文書管理システムです。",
    getStarted: "始める",
    login: "ログイン",
    features: [
      {
        title: "一元化された管理",
        description: "すべての品質文書を、安全でアクセスしやすい1つのデジタルリポジトリで管理、保存、整理します。"
      },
      {
        title: "合理化された承認",
        description: "部門間の文書レビューと承認プロセスを加速する自動ルーティングシステム。"
      },
      {
        title: "コンプライアンスとセキュリティ",
        description: "厳格なアクセス制御、透かし保護、詳細な監査証跡により、ISO規格への準拠を確実にします。"
      },
      {
        title: "印刷の制御",
        description: "機密情報の不正な配布を防ぐため、すべての文書の印刷を監視および承認します。"
      },
      {
        title: "旧版文書の管理",
        description: "使用エラーを防ぐため、無効になった文書の回収とアーカイブを自動化します。"
      }
    ],
    footer1: "PT. Toyo Ink Indonesia.",
    footer2: "全著作権所有。"
  }
};
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
};

const letterVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)", y: 5 },
  visible: { 
    opacity: 1, 
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" } 
  },
};

const TypewriterText = ({ text, className = "", letterClassName = "", showCursor = false }: { text: string; className?: string; letterClassName?: string; showCursor?: boolean }) => (
  <span className={className}>
    {text.split(" ").map((word, wordIndex, array) => (
      <span key={wordIndex} className="inline-block whitespace-nowrap">
        {word.split("").map((char, charIndex) => (
          <motion.span
            key={charIndex}
            variants={letterVariants}
            className={`inline-block ${letterClassName}`}
          >
            {char}
          </motion.span>
        ))}
        {wordIndex < array.length - 1 && (
          <motion.span variants={letterVariants} className={`inline-block ${letterClassName}`} style={{ whiteSpace: "pre" }}>
            {" "}
          </motion.span>
        )}
      </span>
    ))}
    {showCursor && (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "linear",
          delay: 1.5
        }}
        className={`inline-block -ml-1 font-light ${letterClassName}`}
      >
        |
      </motion.span>
    )}
  </span>
);

interface FloatingBadgeProps {
  icon: React.ReactNode;
  text: string;
  tooltipText?: string;
  className?: string;
  delay?: number;
  yOffset?: number;
}

const FloatingBadge = ({ icon, text, tooltipText, className = "", delay = 0, yOffset = 12 }: FloatingBadgeProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
    animate={{
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      y: [0, -yOffset, 0],
      x: [0, yOffset * 0.3, 0],
      rotate: [0, 2, -1, 0]
    }}
    transition={{
      y: { duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay: delay },
      x: { duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay: delay * 0.8 },
      rotate: { duration: 6 + delay, repeat: Infinity, ease: "easeInOut", delay: delay * 1.2 },
      opacity: { duration: 0.8, delay: delay * 0.2 },
      scale: { duration: 0.8, delay: delay * 0.2, type: "spring", damping: 15 },
      filter: { duration: 0.8, delay: delay * 0.2 }
    }}
    className={`absolute bg-card/60 backdrop-blur-2xl border border-primary/20 rounded-2xl p-3 shadow-2xl shadow-primary/10 flex items-center gap-3 z-20 hover:border-primary/50 transition-colors duration-300 group cursor-default ${className}`}
  >
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500 shrink-0">
      {icon}
    </div>
    <div className="flex flex-col overflow-hidden">
      <span className="text-xs md:text-sm font-semibold text-foreground tracking-wide whitespace-nowrap">{text}</span>
      {tooltipText && (
        <span className="text-[10px] text-muted-foreground whitespace-nowrap max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-500 overflow-hidden leading-tight group-hover:mt-1">
          {tooltipText}
        </span>
      )}
    </div>
  </motion.div>
);

const MagneticButton = ({ children, onClick, className }: { children: React.ReactNode, onClick?: () => void, className?: string }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.15, y: y * 0.15 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
};

const FeatureCard = ({ feature, index, icon }: { feature: { title: string; description: string }, index: number, icon: React.ReactNode }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 3D Tilt Motion Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-150, 150], [8, -8]);
  const rotateY = useTransform(x, [-150, 150], [-8, 8]);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    
    // For spotlight
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);

    // For 3D Tilt
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set(clientX - centerX);
    y.set(clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, type: "spring", stiffness: 85 }}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-3xl bg-card/45 border border-primary/10 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300"
    >
      {/* 2026 Laser Border Beam Effect */}
      <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] aspect-square bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(16,185,129,0.8)_360deg)]"
        />
      </div>
      
      {/* Inner Card Background for Border Beam Mask */}
      <div className="absolute inset-[1px] rounded-[calc(1.5rem-1px)] bg-card/90 backdrop-blur-2xl z-0 pointer-events-none" />

      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute inset-[1px] rounded-[calc(1.5rem-1px)] opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(16, 185, 129, 0.12),
              transparent 80%
            )
          `,
        }}
      />
      
      <div className="relative z-10 p-6 h-full flex flex-col pointer-events-none">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] relative z-20">
          <div className="group-hover:animate-pulse">{icon}</div>
        </div>
        <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300 relative z-20">{feature.title}</h3>
        <p className="text-muted-foreground leading-relaxed text-sm relative z-20">{feature.description}</p>
      </div>
    </motion.div>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    const el = document.getElementById("root");
    if (el) {
      setRootElement(el);
    }
  }, []);

  const rootRef = { current: rootElement } as React.RefObject<HTMLElement>;
  const { scrollYProgress } = useScroll({ 
    container: rootElement ? rootRef : undefined 
  });
  
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  useEffect(() => {
    if (!rootElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = rootElement;
      // Only show button if the page is actually scrollable and the user has reached the bottom
      if (scrollHeight > clientHeight + 100 && scrollHeight - scrollTop - clientHeight < 100) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    rootElement.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      rootElement.removeEventListener("scroll", handleScroll);
    };
  }, [rootElement]);

  const scrollToTop = () => {
    if (rootElement) {
      const currentScroll = rootElement.scrollTop;
      animate(currentScroll, 0, {
        type: "spring",
        stiffness: 40,  // Slow and majestic
        damping: 14,    // Elastic swing/bounce at the top
        mass: 1.2,      // Weighted glide
        onUpdate: (latest) => {
          rootElement.scrollTop = latest;
        }
      });
    }
  };
  
  // Parallax scroll effect
  const yPos = useTransform(scrollYProgress, [0, 1], [0, 200]);

  // Interactive Mouse Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    // Normalize coordinates to [-0.5, 0.5]
    mouseX.set((clientX / innerWidth) - 0.5);
    mouseY.set((clientY / innerHeight) - 0.5);
  };

  // Spring physics for smooth movement
  const springConfig = { damping: 30, stiffness: 70, mass: 1.5 };
  const bgX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-45, 45]), springConfig);
  const bgY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-45, 45]), springConfig);
  const heroX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-25, 25]), springConfig);
  const heroY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-25, 25]), springConfig);

  useEffect(() => {
    // Ensure default theme is applied so the landing page looks right
    const defaultTheme = THEME_PRESETS.find((t) => t.name === "Forest Green");
    if (defaultTheme) {
      applyThemeToDocument(defaultTheme);
    }
  }, []);

  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const featureIcons = [
    <FileText className="w-5 h-5 text-primary" />,
    <CheckCircle className="w-5 h-5 text-primary" />,
    <Shield className="w-5 h-5 text-primary" />,
    <Printer className="w-5 h-5 text-primary" />,
    <BookOpen className="w-5 h-5 text-primary" />
  ];

  return (
    <>
      <div 
        onMouseMove={handleMouseMove}
        className="min-h-screen flex flex-col bg-background overflow-x-hidden selection:bg-primary/20 relative"
      >
      {/* Background decorations with parallax */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Subtle Elegant Dynamic Grid */}
        <motion.div 
          animate={{
            backgroundPosition: ["0px 0px", "24px 24px"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.04)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" 
        />
        
        <motion.div style={{ y: yPos }} className="absolute inset-0">
          <motion.div style={{ x: bgX, y: bgY }} className="absolute inset-0">
            {/* Fluid Aurora Orbs */}
            <motion.div 
              animate={{ 
                x: ["0vw", "12vw", "-8vw", "0vw"],
                y: ["0vh", "-8vh", "12vh", "0vh"],
                scale: [1, 1.25, 0.85, 1],
                rotate: [0, 90, 270, 360],
              }}
              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[15%] -right-[10%] w-[75vw] h-[55vw] rounded-full bg-primary/[0.02] blur-[140px]" 
            />
            <motion.div 
              animate={{ 
                x: ["0vw", "-15vw", "10vw", "0vw"],
                y: ["0vh", "12vh", "-8vh", "0vh"],
                scale: [1, 0.8, 1.3, 1],
                rotate: [360, 270, 90, 0],
              }}
              transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
              className="absolute top-[15%] -left-[15%] w-[65vw] h-[65vw] rounded-full bg-secondary/[0.02] blur-[150px]" 
            />
            <motion.div 
              animate={{ 
                x: ["0vw", "10vw", "-15vw", "0vw"],
                y: ["0vh", "15vh", "-5vh", "0vh"],
                scale: [1, 1.15, 0.9, 1],
              }}
              transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[-15%] right-[5%] w-[55vw] h-[45vw] rounded-full bg-primary/[0.01] blur-[130px]" 
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 container mx-auto px-4 md:px-8 py-5 flex items-center justify-between backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform duration-300">
            <span className="text-primary-foreground font-extrabold text-xl tracking-tighter">D</span>
          </div>
          <span className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors duration-300">DMS QA</span>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
              <SelectTrigger className="w-[110px] h-9 text-xs font-semibold bg-transparent border-primary/20 hover:bg-muted/50 transition-colors">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="id">Indonesia</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={() => navigate("/login")}
            variant="outline"
            className="rounded-full px-6 h-9 text-sm font-semibold border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            {t.login}
          </Button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 container mx-auto px-4 md:px-8 pt-12 pb-32">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          {/* Left Text Content */}
          <div className="flex-1 text-center lg:text-left z-10">
            <motion.div
              key={language}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
                <TypewriterText text={t.title} /> <br className="hidden lg:block"/>
                <span className="relative inline-block">
                  <style>
                    {`
                      .shimmer-text {
                        background-image: linear-gradient(to right, #10b981, #3b82f6, #10b981);
                        background-size: 200% auto;
                        animation: shimmer 4s linear infinite;
                      }
                      @keyframes shimmer {
                        0% { background-position: 0% 50%; }
                        100% { background-position: 200% 50%; }
                      }
                    `}
                  </style>
                  <TypewriterText 
                    text={t.titleHighlight} 
                    letterClassName="text-transparent bg-clip-text shimmer-text font-black drop-shadow-sm"
                    showCursor={true}
                  />
                  {/* Highlight Underline Decoration */}
                  <motion.svg 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, delay: 1.5 }}
                    className="absolute w-full h-3 -bottom-1 left-0 text-secondary/40 pointer-events-none" 
                    viewBox="0 0 100 10" preserveAspectRatio="none"
                  >
                    <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                  </motion.svg>
                </span>
              </h1>
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.p 
                key={language}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    filter: "blur(0px)",
                    transition: { staggerChildren: 0.02, delayChildren: 0.1, duration: 0.5 } 
                  },
                  exit: { 
                    opacity: 0, 
                    y: -10, 
                    filter: "blur(8px)",
                    transition: { duration: 0.3, ease: "easeInOut" } 
                  }
                }}
                className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                {t.subtitle.split(" ").map((word, i) => (
                  <motion.span 
                    key={i} 
                    variants={{
                      hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
                      visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", damping: 12, stiffness: 100 } }
                    }}
                    className="inline-block mr-1.5"
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.p>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <MagneticButton 
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto rounded-full h-12 px-8 text-base font-semibold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.03] hover:shadow-primary/45 active:scale-[0.98] transition-all duration-300 group/btn bg-gradient-to-r from-primary to-primary/90 text-primary-foreground"
              >
                {t.getStarted}
                <motion.span className="inline-block transition-transform duration-300 group-hover/btn:translate-x-1.5">
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </MagneticButton>
            </motion.div>
          </div>

          {/* Right Lottie Animation with Mouse Parallax and Floating Badges */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
            className="flex-1 w-full max-w-lg lg:max-w-none relative z-10"
            style={{ x: heroX, y: heroY }}
          >
            {/* Animated Glow behind Lottie */}
            <motion.div 
              animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-primary/10 rounded-full blur-3xl -z-10"
            />

            {/* Floating Badges */}
            <FloatingBadge 
              icon={<Shield className="w-4 h-4" />}
              text="ISO 9001"
              tooltipText="Quality Management Representative"
              className="top-6 left-4 md:left-12"
              delay={0}
            />
            <FloatingBadge 
              icon={<Shield className="w-4 h-4" />}
              text="ISO 14001"
              tooltipText="Environmental Management Representative"
              className="top-20 right-16 md:right-36"
              delay={0.8}
            />
            <FloatingBadge 
              icon={<CheckCircle className="w-4 h-4" />}
              text="Halal (SJPH)"
              tooltipText="Halal Management Representative"
              className="top-36 left-2 md:-left-4"
              delay={1.5}
            />

            <Lottie 
              animationData={DocHero} 
              className="w-full h-auto drop-shadow-2xl filter relative z-10"
            />
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="mt-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {t.features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} icon={featureIcons[index]} />
            ))}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-border/40 bg-card/60 backdrop-blur-md py-6 text-center text-muted-foreground flex flex-col items-center justify-center relative z-20 w-full">
        <p className="text-xs font-medium">Copyright © {new Date().getFullYear()} {t.footer1}</p>
        <p className="text-[10px] opacity-75 mt-0.5">{t.footer2}</p>
        <p className="text-[10px] font-semibold opacity-70 mt-1">Project by Siti Nurjanah (QA) | Developer by Lukman Pirmansah (IT)</p>
      </footer>
    </div>

    {/* Scroll to Top Button (Outside main container to escape any layout contexts) */}
    <AnimatePresence>
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.3, y: 50, filter: "blur(8px)" }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0, 
            filter: "blur(0px)",
            transition: {
              type: "spring",
              stiffness: 100,
              damping: 15,
              mass: 1
            }
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.3, 
            y: 50, 
            filter: "blur(8px)",
            transition: {
              duration: 0.35,
              ease: "easeInOut"
            }
          }}
          whileHover={{ 
            scale: 1.15, 
            y: -8,
            transition: { type: "spring", stiffness: 300, damping: 15 }
          }}
          whileTap={{ scale: 0.92 }}
          onClick={scrollToTop}
          className="fixed z-[100] w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40 flex items-center justify-center transition-colors cursor-pointer"
          style={{ 
            position: "fixed",
            bottom: "clamp(120px, 15vh, 160px)", 
            right: "clamp(1.5rem, 5vw, 2.5rem)", 
            left: "auto" 
          }}
        >
          <ArrowUp className="w-5 h-5 md:w-6 md:h-6" />
        </motion.button>
      )}
    </AnimatePresence>
  </>
  );
}
