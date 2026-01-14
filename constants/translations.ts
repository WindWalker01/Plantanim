export type Language = "en" | "tl";

export interface Translations {
  // Settings Screen
  "settings.title": string;
  "settings.profile.settings": string;
  "settings.farming.settings": string;
  "settings.preferences": string;
  "settings.update.location": string;
  "settings.manage.crops": string;
  "settings.notifications": string;
  "settings.language": string;
  "settings.farmer.id": string;
  "settings.version": string;

  // Language names
  "language.english": string;
  "language.filipino": string;
}

export const translations: Record<Language, Translations> = {
  en: {
    "settings.title": "Profile & Settings",
    "settings.profile.settings": "Profile & Settings",
    "settings.farming.settings": "FARMING SETTINGS",
    "settings.preferences": "PREFERENCES",
    "settings.update.location": "Update My Location",
    "settings.manage.crops": "Manage My Crops",
    "settings.notifications": "Notifications",
    "settings.language": "Language",
    "settings.farmer.id": "Farmer ID:",
    "settings.version": "Plantanim v2.4.1 (2024)",
    "language.english": "English (US)",
    "language.filipino": "Filipino",
  },
  tl: {
    "settings.title": "Profile at Mga Setting",
    "settings.profile.settings": "Profile at Mga Setting",
    "settings.farming.settings": "MGA SETTING NG PAGSASAKA",
    "settings.preferences": "MGA PAGKAKAGUSTO",
    "settings.update.location": "I-update ang Aking Lokasyon",
    "settings.manage.crops": "Pamahalaan ang Aking mga Tanim",
    "settings.notifications": "Mga Notification",
    "settings.language": "Wika",
    "settings.farmer.id": "Farmer ID:",
    "settings.version": "Plantanim v2.4.1 (2024)",
    "language.english": "English (US)",
    "language.filipino": "Filipino",
  },
};

