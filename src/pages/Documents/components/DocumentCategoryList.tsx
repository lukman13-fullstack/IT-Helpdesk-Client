import { useState } from "react";
import { Folder, Grid2x2, List, Check } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface Item {
  title: string;
  description: string;
  category: string;
  color?: string;
}

const getItems = (t: (key: string) => string): Item[] => [
  {
    title: t("documentControl.allDocuments"),
    description: t("documentControl.viewAllRepo"),
    category: "",
    color: "text-blue-500",
  },
  {
    title: t("documentControl.forms"),
    description: t("documentControl.formsDesc"),
    category: "form",
    color: "text-purple-500",
  },
  {
    title: t("documentControl.standards"),
    description: t("documentControl.standardsDesc"),
    category: "standard",
    color: "text-green-500",
  },
  {
    title: t("documentControl.workInstructions"),
    description: t("documentControl.workInstructionsDesc"),
    category: "instruksi_kerja",
    color: "text-orange-500",
  },
  {
    title: t("documentControl.procedures"),
    description: t("documentControl.proceduresDesc"),
    category: "prosedur",
    color: "text-red-500",
  },
  {
    title: t("documentControl.companyManuals"),
    description: t("documentControl.companyManualsDesc"),
    category: "manual_perusahaan",
    color: "text-indigo-500",
  },
  {
    title: t("documentControl.halalManuals"),
    description: t("documentControl.halalManualsDesc"),
    category: "manual_halal",
    color: "text-teal-500",
  },
  {
    title: t("documentControl.external"),
    description: t("documentControl.externalDesc"),
    category: "external",
    color: "text-gray-500",
  },
];

function GridItem({ item, isSelected, onClick }: { item: Item; isSelected: boolean; onClick: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "relative p-5 rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-3 transition-all duration-300 border-2",
        isSelected 
          ? "bg-primary/5 border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]" 
          : "bg-white border-transparent hover:border-primary/20 shadow-lg hover:shadow-xl"
      )}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 p-1 bg-primary rounded-full text-white shadow-sm">
          <Check className="w-3 h-3" />
        </div>
      )}
      <div 
        className={cn(
          "p-4 rounded-2xl transition-all duration-300",
          isSelected ? "bg-white shadow-inner" : "bg-primary/5 group-hover:bg-primary/10"
        )}
      >
        <Folder
          className={cn(
            "w-8 h-8 transition-colors duration-300",
            isSelected ? "text-primary fill-primary/20" : item.color || "text-gray-500"
          )}
        />
      </div>
      <div className="text-center space-y-1">
        <h2 className={cn(
          "text-sm font-bold transition-colors",
          isSelected ? "text-primary" : "text-gray-700"
        )}>
          {item.title}
        </h2>
        <p className="text-[10px] text-muted-foreground line-clamp-1 font-medium">{item.description}</p>
      </div>
    </motion.div>
  );
}

function ListItem({ item, isSelected, onClick }: { item: Item; isSelected: boolean; onClick: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "group flex items-center p-3 px-4 rounded-xl cursor-pointer border transition-all duration-200",
        isSelected 
          ? "bg-primary/5 border-primary shadow-sm" 
          : "bg-white border-transparent hover:border-primary/20 hover:shadow-md hover:bg-gray-50/50"
      )}
    >
      <div className={cn(
        "p-2 rounded-lg mr-4 transition-colors",
        isSelected ? "bg-white text-primary" : "bg-gray-100 text-gray-500 group-hover:text-primary group-hover:bg-primary/10"
      )}>
        <Folder className={cn("w-5 h-5", isSelected && "fill-primary/20")} />
      </div>
      <div className="flex-1">
        <h2 className={cn(
          "text-sm font-bold",
          isSelected ? "text-primary" : "text-gray-700"
        )}>
          {item.title}
        </h2>
        <p className="text-xs text-muted-foreground hidden sm:block">{item.description}</p>
      </div>
      {isSelected && <Check className="w-4 h-4 text-primary ml-2" />}
    </motion.div>
  );
}

export default function DocumentCategoryList() {
  const { t } = useLanguage();
  const [isGrid, setIsGrid] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get("category") || "";

  const handleCategoryClick = (category: string) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (category) {
        params.set("category", category);
      } else {
        params.delete("category");
      }
      params.set("page", "1");
      return params;
    });
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
           <h3 className="text-lg font-bold text-gray-800">{t("documentControl.categories")}</h3>
           <p className="text-xs text-muted-foreground">{t("documentControl.filterByType")}</p>
        </div>
        <div className="flex bg-muted/50 p-1 rounded-lg border border-muted">
          <button
            onClick={() => setIsGrid(true)}
            className={cn(
              "p-2 rounded-md transition-all duration-200 flex items-center gap-2",
              isGrid 
                ? "bg-white text-primary shadow-sm ring-1 ring-black/5" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Grid2x2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsGrid(false)}
            className={cn(
              "p-2 rounded-md transition-all duration-200 flex items-center gap-2",
              !isGrid 
                ? "bg-white text-primary shadow-sm ring-1 ring-black/5" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <motion.div 
        layout
        className={cn(
          "w-full",
          isGrid 
            ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-4" 
            : "flex flex-col gap-3"
        )}
      >
        <AnimatePresence mode="popLayout">
          {getItems(t).map((item) => (
            isGrid ? (
              <GridItem 
                key={`grid-${item.category}`} 
                item={item} 
                isSelected={currentCategory === item.category}
                onClick={() => handleCategoryClick(item.category)}
              />
            ) : (
              <ListItem 
                key={`list-${item.category}`} 
                item={item} 
                isSelected={currentCategory === item.category}
                onClick={() => handleCategoryClick(item.category)}
              />
            )
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
