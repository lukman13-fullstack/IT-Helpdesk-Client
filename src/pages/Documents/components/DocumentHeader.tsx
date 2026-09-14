import { Button } from "@/components/ui/button";
import { FilePlusIcon, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function DocumentHeader() {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden bg-gradient-to-br from-white via-white to-gray-50 border border-muted/50 rounded-2xl p-8 shadow-sm"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
             <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-primary" />
             </div>
             <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
               {t("documentControl.title")}
             </h1>
          </div>
          <p className="text-base text-muted-foreground max-w-xl">
            {t("documentControl.description")}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="default" 
            size="lg"
            asChild
            className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 rounded-xl px-6"
          >
            <Link to="/documents/create" className="flex items-center font-semibold">
              <FilePlusIcon className="mr-2 h-5 w-5" />
              {t("documentControl.registerNew")}
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
