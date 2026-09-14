/**
 * Shared category label mapping.
 * Maps raw DB category values to user-friendly display labels.
 */
export const CATEGORY_LABELS: Record<string, string> = {
  form: "Form",
  standard: "Standard",
  instruksi_kerja: "Work Instructions Document",
  prosedur: "Procedure",
  manual_perusahaan: "Manual Company Document",
  manual_halal: "Manual Halal",
  external: "External",
};

/**
 * Get the display label for a document category.
 * Falls back to capitalizing the raw value if unknown.
 */
export function getCategoryLabel(category: string): string {
  return (
    CATEGORY_LABELS[category] ||
    category
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}
