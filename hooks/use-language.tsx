import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Language, translations } from "@/constants/translations";

const LANGUAGE_KEY = "@plantanim:language";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: keyof typeof translations.en) => string;
  languageName: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage === "tl" || savedLanguage === "en") {
        setLanguageState(savedLanguage);
      } else if (savedLanguage === "Filipino") {
        // Handle backward compatibility with old format
        setLanguageState("tl");
        await AsyncStorage.setItem(LANGUAGE_KEY, "tl");
      } else if (savedLanguage === "English (US)") {
        // Handle backward compatibility with old format
        setLanguageState("en");
        await AsyncStorage.setItem(LANGUAGE_KEY, "en");
      }
    } catch (error) {
      console.error("Error loading language:", error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || key;
  };

  const languageName =
    language === "en" ? translations.en["language.english"] : translations.tl["language.filipino"];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageName }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

