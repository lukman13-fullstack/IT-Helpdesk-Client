export const stripHtml = (html: string | undefined | null): string => {
  if (!html) return "";
  
  // First, parse the HTML to get raw text
  const doc = new DOMParser().parseFromString(html, 'text/html');
  let text = doc.body.textContent || "";
  
  // Replace non-breaking spaces (both unicode and entity) with normal space
  text = text.replace(/\u00A0/g, ' ').replace(/&nbsp;/g, ' ');
  
  // Replace any leftover HTML entities that might have been double escaped
  text = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  
  // Final fallback to strip any accidental literal tags if they exist
  text = text.replace(/<[^>]*>?/gm, '');
  
  return text.trim();
};

export const cleanTemplateData = (data: any): any => {
  if (!data) return data;
  return {
    ...data,
    instructionText: stripHtml(data.instructionText),
    topSections: data.topSections?.map((ts: any) => ({
      ...ts,
      text: ts.text
    })) || [],
    sections: data.sections?.map((s: any) => ({
      ...s,
      steps: s.steps?.map((step: any) => ({
        ...step,
        stepText: step.stepText,
        checkPointText: step.checkPointText
      })) || []
    })) || []
  };
};
