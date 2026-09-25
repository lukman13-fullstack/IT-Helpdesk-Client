import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  Variants,
  AnimatePresence,
  animate,
  useMotionTemplate,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Shield,
  CheckCircle,
  Printer,
  ArrowRight,
  BookOpen,
  Globe,
  ArrowUp,
  Ticket,
  Zap,
  MonitorSmartphone,
  Headset,
} from "lucide-react";

import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Lottie from "lottie-react";
import DatabaseAnim from "@/assets/lottie/Cloud robotics abstract.json";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Language } from "@/translations";

const TRANSLATIONS = {
  en: {
    title: "Welcome to",
    titleHighlight: "IT Helpdesk System",
    subtitle:
      "A centralized platform to manage IT requests, troubleshoot issues, and provide fast technical support to ensure smooth business operations.",
    getStarted: "Get Started",
    login: "Login",
    features: [
      {
        title: "Ticket Management",
        description:
          "Easily submit, track, and manage all your IT requests in one organized digital workspace.",
      },
      {
        title: "Fast Resolution",
        description:
          "Automated routing and priority assignment to ensure critical issues are resolved quickly.",
      },
      {
        title: "Knowledge Base",
        description:
          "Access a comprehensive repository of solutions and guides for quick self-service troubleshooting.",
      },
      {
        title: "Asset Tracking",
        description:
          "Keep track of hardware and software assets, their status, and assignments across the organization.",
      },
      {
        title: "24/7 Support",
        description:
          "Continuous monitoring and support system to minimize downtime and maintain productivity.",
      },
    ],
    footer1: "PT. Toyo Ink Indonesia.",
    footer2: "All rights reserved.",
  },
  id: {
    title: "Selamat Datang di",
    titleHighlight: "Sistem IT Helpdesk",
    subtitle:
      "Platform terpusat untuk mengelola permintaan IT, menangani kendala teknis, dan memberikan dukungan cepat guna memastikan kelancaran operasional bisnis.",
    getStarted: "Mulai Sekarang",
    login: "Masuk",
    features: [
      {
        title: "Manajemen Tiket",
        description:
          "Kirim, pantau, dan kelola semua permintaan IT dengan mudah dalam satu ruang kerja digital yang teratur.",
      },
      {
        title: "Penyelesaian Cepat",
        description:
          "Sistem routing otomatis dan penentuan prioritas untuk memastikan masalah kritis terselesaikan dengan cepat.",
      },
      {
        title: "Basis Pengetahuan",
        description:
          "Akses kumpulan solusi dan panduan komprehensif untuk penyelesaian masalah mandiri secara cepat.",
      },
      {
        title: "Pelacakan Aset",
        description:
          "Pantau aset perangkat keras dan perangkat lunak, status, serta distribusinya di seluruh perusahaan.",
      },
      {
        title: "Dukungan 24/7",
        description:
          "Sistem pemantauan dan dukungan berkelanjutan untuk meminimalkan waktu henti dan menjaga produktivitas.",
      },
    ],
    footer1: "PT. Toyo Ink Indonesia.",
    footer2: "Hak cipta dilindungi undang-undang.",
  },
  ja: {
    title: "ようこそ",
    titleHighlight: "IT ヘルプデスクシステム",
    subtitle:
      "IT リクエストを管理し、問題のトラブルシューティングを行い、スムーズなビジネス運営を確保するための迅速なテクニカルサポートを提供する集中型プラットフォーム。",
    getStarted: "始める",
    login: "ログイン",
    features: [
      {
        title: "チケット管理",
        description:
          "すべてのITリクエストを整理されたデジタルトワークスペースで簡単に送信、追跡、管理できます。",
      },
      {
        title: "迅速な解決",
        description:
          "自動ルーティングと優先順位の割り当てにより、重大な問題が迅速に解決されます。",
      },
      {
        title: "ナレッジベース",
        description:
          "迅速なセルフサービストラブルシューティングのための解決策とガイドの包括的なリポジトリにアクセスします。",
      },
      {
        title: "資産追跡",
        description:
          "ハードウェアおよびソフトウェア資産、そのステータス、および組織全体での割り当てを追跡します。",
      },
      {
        title: "24時間年中無休のサポート",
        description:
          "ダウンタイムを最小限に抑え、生産性を維持するための継続的な監視およびサポートシステム。",
      },
    ],
    footer1: "PT. Toyo Ink Indonesia.",
    footer2: "全著作権所有。",
  },
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
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const TypewriterText = ({
  text,
  className = "",
  letterClassName = "",
  showCursor = false,
}: {
  text: string;
  className?: string;
  letterClassName?: string;
  showCursor?: boolean;
}) => (
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
          <motion.span
            variants={letterVariants}
            className={`inline-block ${letterClassName}`}
            style={{ whiteSpace: "pre" }}
          >
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
          delay: 1.5,
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

const FloatingBadge = ({
  icon,
  text,
  tooltipText,
  className = "",
  delay = 0,
  yOffset = 12,
}: FloatingBadgeProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
    animate={{
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      y: [0, -yOffset, 0],
      x: [0, yOffset * 0.3, 0],
      rotate: [0, 2, -1, 0],
    }}
    transition={{
      y: {
        duration: 4 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      },
      x: {
        duration: 5 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay * 0.8,
      },
      rotate: {
        duration: 6 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay * 1.2,
      },
      opacity: { duration: 0.8, delay: delay * 0.2 },
      scale: { duration: 0.8, delay: delay * 0.2, type: "spring", damping: 15 },
      filter: { duration: 0.8, delay: delay * 0.2 },
    }}
    className={`absolute bg-card/60 backdrop-blur-2xl border border-primary/20 rounded-2xl p-3 shadow-2xl shadow-primary/10 flex items-center gap-3 z-20 hover:border-primary/50 transition-colors duration-300 group cursor-default ${className}`}
  >
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500 shrink-0">
      {icon}
    </div>
    <div className="flex flex-col overflow-hidden">
      <span className="text-xs md:text-sm font-semibold text-foreground tracking-wide whitespace-nowrap">
        {text}
      </span>
      {tooltipText && (
        <span className="text-[10px] text-muted-foreground whitespace-nowrap max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-500 overflow-hidden leading-tight group-hover:mt-1">
          {tooltipText}
        </span>
      )}
    </div>
  </motion.div>
);

const MagneticButton = ({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => {
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

const FeatureCard = ({
  feature,
  index,
  icon,
}: {
  feature: { title: string; description: string };
  index: number;
  icon: React.ReactNode;
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 3D Tilt Motion Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-150, 150], [8, -8]);
  const rotateY = useTransform(x, [-150, 150], [-8, 8]);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
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
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        type: "spring",
        stiffness: 85,
      }}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-3xl bg-card/45 border border-primary/10 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 h-full flex flex-col"
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

      <div className="relative z-10 p-6 flex flex-col pointer-events-none flex-1">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] relative z-20">
          <div className="group-hover:animate-pulse">{icon}</div>
        </div>
        <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300 relative z-20">
          {feature.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed text-sm relative z-20">
          {feature.description}
        </p>
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
    container: rootElement ? rootRef : undefined,
  });

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (!rootElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = rootElement;
      // Only show button if the page is actually scrollable and the user has reached the bottom
      if (
        scrollHeight > clientHeight + 100 &&
        scrollHeight - scrollTop - clientHeight < 100
      ) {
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
        stiffness: 40, // Slow and majestic
        damping: 14, // Elastic swing/bounce at the top
        mass: 1.2, // Weighted glide
        onUpdate: (latest) => {
          rootElement.scrollTop = latest;
        },
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
    mouseX.set(clientX / innerWidth - 0.5);
    mouseY.set(clientY / innerHeight - 0.5);
  };

  // Spring physics for smooth movement
  const springConfig = { damping: 30, stiffness: 70, mass: 1.5 };
  const bgX = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-45, 45]),
    springConfig,
  );
  const bgY = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [-45, 45]),
    springConfig,
  );
  const heroX = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-25, 25]),
    springConfig,
  );
  const heroY = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [-25, 25]),
    springConfig,
  );



  const t =
    TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const featureIcons = [
    <Ticket className="w-5 h-5 text-primary" />,
    <Zap className="w-5 h-5 text-primary" />,
    <BookOpen className="w-5 h-5 text-primary" />,
    <MonitorSmartphone className="w-5 h-5 text-primary" />,
    <Headset className="w-5 h-5 text-primary" />,
  ];

  return (
    <>
      <div
        onMouseMove={handleMouseMove}
        className="min-h-screen flex flex-col bg-background overflow-x-hidden selection:bg-primary/20 relative"
      >
        {/* Background decorations with parallax */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
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
                transition={{
                  duration: 24,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
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
              <span className="text-primary-foreground font-extrabold text-lg tracking-tighter">
                IT
              </span>
            </div>
            <span className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors duration-300">
              IT Helpdesk
            </span>
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
              <Select
                value={language}
                onValueChange={(v) => setLanguage(v as Language)}
              >
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
        <main className="flex-1 relative z-10 container mx-auto px-4 md:px-8 pt-16 pb-32">
          <div className="flex flex-col items-center justify-center gap-12">
            {/* Top Text Content */}
            <div className="flex-1 text-center z-20 w-full max-w-4xl flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 border border-primary/20 backdrop-blur-md shadow-[0_0_15px_rgba(var(--primary),0.2)]"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
                Next-Gen IT Support
              </motion.div>

              <motion.div
                key={language}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-foreground mb-6 leading-[1.1]">
                  <TypewriterText text={t.title} />{" "}
                  <br className="hidden md:block" />
                  <span className="relative inline-block mt-2">
                    <style>
                      {`
                      .shimmer-text {
                        background-image: linear-gradient(to right, var(--primary), #3b82f6, var(--primary));
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
                      letterClassName="text-transparent bg-clip-text shimmer-text drop-shadow-xl"
                      showCursor={true}
                    />
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
                      transition: {
                        staggerChildren: 0.02,
                        delayChildren: 0.1,
                        duration: 0.5,
                      },
                    },
                    exit: {
                      opacity: 0,
                      y: -10,
                      filter: "blur(8px)",
                      transition: { duration: 0.3, ease: "easeInOut" },
                    },
                  }}
                  className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                  {t.subtitle}
                </motion.p>
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.4,
                  type: "spring",
                  stiffness: 120,
                }}
                className="flex justify-center"
              >
                <MagneticButton
                  onClick={() => navigate("/login")}
                  className="rounded-full h-14 px-10 text-lg font-bold flex items-center justify-center gap-3 shadow-[0_10px_40px_-10px_rgba(var(--primary),0.6)] hover:scale-[1.05] active:scale-[0.95] transition-all duration-300 group/btn bg-gradient-to-r from-primary to-[#3b82f6] text-white"
                >
                  {t.getStarted}
                  <motion.span className="inline-block transition-transform duration-300 group-hover/btn:translate-x-2">
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </MagneticButton>
              </motion.div>
            </div>

            {/* Centerpiece Lottie Animation with Mix Blend Mode */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 1,
                delay: 0.3,
                type: "spring",
                stiffness: 70,
              }}
              className="w-full max-w-lg relative z-10 mt-8 md:mt-16"
              style={{ y: heroY }}
            >
              {/* Ambient Glow behind Lottie */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-primary/20 rounded-full blur-[100px] -z-10"
              />

              {/* Floating Badges rearranged around the centerpiece */}
              <FloatingBadge
                icon={<Zap className="w-5 h-5" />}
                text="Fast Support"
                className="top-10 -left-10 md:-left-24"
                delay={0}
              />
              <FloatingBadge
                icon={<Ticket className="w-5 h-5" />}
                text="Quick Ticket"
                className="top-1/3 -right-6 md:-right-24"
                delay={0.8}
              />
              <FloatingBadge
                icon={<MonitorSmartphone className="w-5 h-5" />}
                text="Asset Tracking"
                className="bottom-10 -left-6 md:-left-16"
                delay={1.5}
              />

              <div className="relative">
                {/* mix-blend-multiply hides the white background, REMOVED drop-shadow to hide the box outline */}
                <Lottie
                  animationData={DatabaseAnim}
                  className="w-full h-auto mix-blend-multiply opacity-90 relative z-10"
                />
              </div>
            </motion.div>
          </div>

          {/* Modern Bento Features Grid */}
          <div className="mt-32 relative z-20">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
                Everything you need.
              </h2>
              <p className="text-lg text-muted-foreground">
                Powerful tools designed for modern IT teams.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-6 gap-6 max-w-6xl mx-auto auto-rows-fr"
            >
              {t.features.map((feature, index) => {
                let spanClass = "md:col-span-2"; // First 3 items take 2/6 columns each (1/3 width)
                if (index === 3 || index === 4) {
                  spanClass = "md:col-span-3"; // Last 2 items take 3/6 columns each (1/2 width)
                }
                return (
                  <div key={index} className={`col-span-1 ${spanClass} h-full`}>
                    <FeatureCard
                      feature={feature}
                      index={index}
                      icon={featureIcons[index]}
                    />
                  </div>
                );
              })}
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-20 border-t border-border/40 bg-card/60 backdrop-blur-md py-6 text-center text-muted-foreground flex flex-col items-center justify-center relative z-20 w-full">
          <p className="text-xs font-medium">
            Copyright © {new Date().getFullYear()} {t.footer1}
          </p>
          <p className="text-[10px] opacity-75 mt-0.5">{t.footer2}</p>
          <p className="text-[10px] font-semibold opacity-70 mt-1">
            Project by Lukman Pirmansah (IT)
          </p>
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
                mass: 1,
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.3,
              y: 50,
              filter: "blur(8px)",
              transition: {
                duration: 0.35,
                ease: "easeInOut",
              },
            }}
            whileHover={{
              scale: 1.15,
              y: -8,
              transition: { type: "spring", stiffness: 300, damping: 15 },
            }}
            whileTap={{ scale: 0.92 }}
            onClick={scrollToTop}
            className="fixed z-[100] w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40 flex items-center justify-center transition-colors cursor-pointer"
            style={{
              position: "fixed",
              bottom: "clamp(120px, 15vh, 160px)",
              right: "clamp(1.5rem, 5vw, 2.5rem)",
              left: "auto",
            }}
          >
            <ArrowUp className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
