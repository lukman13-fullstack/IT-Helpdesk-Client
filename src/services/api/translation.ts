import { _fetchWithAuth, BASE_URL } from "./client";

export const translateText = async (text: string, targetLang: string): Promise<string> => {
  try {
    const response = await _fetchWithAuth(`${BASE_URL}/translate/text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, targetLang }),
    });

    if (!response.ok) {
      throw new Error(`Failed to translate. Status: ${response.status}`);
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error("Translation API error:", error);
    throw error;
  }
};
