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

  // Home Screen
  "home.location.current": string;
  "home.what.this.means": string;
  "home.advice.rain": string;
  "home.advice.no.data": string;
  "home.see.suggestions": string;
  "home.hourly.forecast": string;
  "home.seven.day.outlook": string;
  "home.loading.forecast": string;

  // Alerts Screen
  "alerts.title": string;
  "alerts.notifications": string;
  "alerts.all": string;
  "alerts.urgent": string;
  "alerts.weather": string;
  "alerts.farming": string;
  "alerts.earlier.week": string;
  "alerts.live.tracking": string;
  "alerts.today": string;
  "alerts.yesterday": string;
  "alerts.completed": string;
  "alerts.retry": string;
  "alerts.expo.warning.title": string;
  "alerts.expo.warning.body": string;
  "alerts.stats.scheduled": string;
  "alerts.stats.today": string;
  "alerts.stats.week": string;
  "alerts.hint": string;

  // Calendar Screen
  "calendar.title": string;
  "calendar.safe": string;
  "calendar.caution": string;
  "calendar.high.risk": string;
  "calendar.no.tasks": string;
  "calendar.complete": string;
  "calendar.skip": string;

  // Login Screen
  "login.welcome": string;
  "login.instruction": string;
  "login.email": string;
  "login.password": string;
  "login.forgot.password": string;
  "login.button": string;
  "login.signup.text": string;
  "login.signup.link": string;
  "login.help": string;
  "login.privacy": string;
  "login.terms.text": string;
  "login.terms.link": string;
  "login.privacy.link": string;

  // Set Location Screen
  "location.title": string;
  "location.municipality": string;
  "location.barangay": string;
  "location.auto.detect": string;
  "location.save": string;
  "location.select.municipality": string;
  "location.select.barangay": string;
  "location.permission.title": string;
  "location.permission.message": string;
  "location.auto.detect.failed": string;

  // Personalization Screen
  "personalization.title": string;
  "personalization.question": string;
  "personalization.instruction": string;
  "personalization.selected": string;
  "personalization.finish": string;

  // Set Planting Dates Screen
  "planting.title": string;
  "planting.info": string;
  "planting.no.crops": string;
  "planting.no.crops.desc": string;
  "planting.duration": string;
  "planting.set.date": string;
  "planting.edit.date": string;

  // Farming Suggestions Screen
  "suggestions.title": string;
  "suggestions.loading": string;
  "suggestions.error": string;

  // Common
  "common.back": string;
  "common.save": string;
  "common.cancel": string;
  "common.ok": string;
  "common.retry": string;
  "common.skip": string;
  "common.next": string;
  "common.finish": string;
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
    "home.location.current": "Current Location",
    "home.what.this.means": "What this means for your farm",
    "home.advice.rain": "Rain chance today is {{percent}}%. Plan fertilizer and field work around heavy showers.",
    "home.advice.no.data": "We'll tailor farming advice as soon as the latest rain forecast is available for your farm.",
    "home.see.suggestions": "See Farming Suggestions",
    "home.hourly.forecast": "Hourly Forecast",
    "home.seven.day.outlook": "7-Day Outlook",
    "home.loading.forecast": "Unable to load latest forecast.",
    "alerts.title": "Alerts & Notifications",
    "alerts.notifications": "Notifications",
    "alerts.all": "All",
    "alerts.urgent": "Urgent",
    "alerts.weather": "Weather",
    "alerts.farming": "Farming",
    "alerts.earlier.week": "EARLIER THIS WEEK",
    "alerts.live.tracking": "LIVE TRACKING",
    "alerts.today": "Today",
    "alerts.yesterday": "Yesterday",
    "alerts.completed": "Completed",
    "alerts.retry": "Retry",
    "alerts.expo.warning.title": "Notifications Limited in Expo Go",
    "alerts.expo.warning.body": "Push notifications work fully in standalone builds only. In Expo Go, you'll see alerts here but may not receive push notifications.",
    "alerts.stats.scheduled": "Scheduled",
    "alerts.stats.today": "Today",
    "alerts.stats.week": "This Week",
    "alerts.hint": "Enable notifications to receive timely alerts for your crops and weather conditions.",
    "calendar.title": "Calendar",
    "calendar.safe": "Safe",
    "calendar.caution": "Caution",
    "calendar.high.risk": "High Risk",
    "calendar.no.tasks": "No tasks scheduled for this day.",
    "calendar.complete": "Complete",
    "calendar.skip": "Skip",
    "login.welcome": "Welcome Back",
    "login.instruction": "Please login with your email and password.",
    "login.email": "Email Address",
    "login.password": "Password",
    "login.forgot.password": "Forgot Password?",
    "login.button": "Login",
    "login.signup.text": "New to Plantanim? ",
    "login.signup.link": "Sign Up",
    "login.help": "Help",
    "login.privacy": "Privacy",
    "login.terms.text": "By logging in, you agree to Project Plantanim's ",
    "login.terms.link": "Terms of Service",
    "login.privacy.link": "Privacy Policy",
    "location.title": "Set Location",
    "location.municipality": "Municipality",
    "location.barangay": "Barangay",
    "location.auto.detect": "Auto-detect My Location",
    "location.save": "Save Location",
    "location.select.municipality": "Select Municipality",
    "location.select.barangay": "Select Barangay",
    "location.permission.title": "Location Permission",
    "location.permission.message": "Permission is required to auto-detect your location.",
    "location.auto.detect.failed": "Auto-detect failed",
    "personalization.title": "Personalization",
    "personalization.question": "What are you growing?",
    "personalization.instruction": "Select all that apply to get personalized weather alerts for your crops.",
    "personalization.selected": "Selected",
    "personalization.finish": "Finish",
    "planting.title": "Set Planting Dates",
    "planting.info": "Set planting dates for your crops to generate daily farming tasks automatically.",
    "planting.no.crops": "No Crops Selected",
    "planting.no.crops.desc": "Please select crops in Personalization first.",
    "planting.duration": "Duration: {{days}} days",
    "planting.set.date": "Set Planting Date",
    "planting.edit.date": "Edit Planting Date",
    "suggestions.title": "Farming Suggestions",
    "suggestions.loading": "Loading weather suggestions...",
    "suggestions.error": "Error",
    "common.back": "Back",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.ok": "OK",
    "common.retry": "Retry",
    "common.skip": "Skip",
    "common.next": "Next",
    "common.finish": "Finish",
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
    "home.location.current": "Kasalukuyang Lokasyon",
    "home.what.this.means": "Ano ang ibig sabihin nito para sa inyong bukid",
    "home.advice.rain": "Ang tsansa ng ulan ngayon ay {{percent}}%. Planuhin ang pagpapataba at gawaing bukid na malayo sa malakas na ulan.",
    "home.advice.no.data": "Makakapagbigay kami ng payo sa pagsasaka kapag may available na na pinakabagong forecast ng ulan para sa inyong bukid.",
    "home.see.suggestions": "Tingnan ang Mga Mungkahi sa Pagsasaka",
    "home.hourly.forecast": "Hourly Forecast",
    "home.seven.day.outlook": "7-Araw na Outlook",
    "home.loading.forecast": "Hindi ma-load ang pinakabagong forecast.",
    "alerts.title": "Mga Alert at Notification",
    "alerts.notifications": "Mga Notification",
    "alerts.all": "Lahat",
    "alerts.urgent": "Urgent",
    "alerts.weather": "Panahon",
    "alerts.farming": "Pagsasaka",
    "alerts.earlier.week": "NOONG NAKARAANG LINGGO",
    "alerts.live.tracking": "LIVE TRACKING",
    "alerts.today": "Ngayon",
    "alerts.yesterday": "Kahapon",
    "alerts.completed": "Natapos",
    "alerts.retry": "Subukan ulit",
    "alerts.expo.warning.title": "Limitado ang Notifications sa Expo Go",
    "alerts.expo.warning.body": "Gumagana nang lubusan ang push notifications sa standalone builds lamang. Sa Expo Go, makikita ninyo ang mga alert dito ngunit maaaring hindi kayo makatanggap ng push notifications.",
    "alerts.stats.scheduled": "Naka-schedule",
    "alerts.stats.today": "Ngayon",
    "alerts.stats.week": "Sa Linggong Ito",
    "alerts.hint": "I-enable ang notifications para makatanggap ng napapanahong alerts para sa inyong mga tanim at kondisyon ng panahon.",
    "calendar.title": "Kalendaryo",
    "calendar.safe": "Ligtas",
    "calendar.caution": "Mag-ingat",
    "calendar.high.risk": "Mataas na Panganib",
    "calendar.no.tasks": "Walang naka-schedule na gawain para sa araw na ito.",
    "calendar.complete": "Tapusin",
    "calendar.skip": "Laktawan",
    "login.welcome": "Maligayang Pagbabalik",
    "login.instruction": "Mag-login gamit ang inyong email at password.",
    "login.email": "Email Address",
    "login.password": "Password",
    "login.forgot.password": "Nakalimutan ang Password?",
    "login.button": "Mag-login",
    "login.signup.text": "Bago sa Plantanim? ",
    "login.signup.link": "Mag-sign Up",
    "login.help": "Tulong",
    "login.privacy": "Privacy",
    "login.terms.text": "Sa pag-login, sumasang-ayon kayo sa ",
    "login.terms.link": "Terms of Service",
    "login.privacy.link": "Privacy Policy",
    "location.title": "Itakda ang Lokasyon",
    "location.municipality": "Munispalidad",
    "location.barangay": "Barangay",
    "location.auto.detect": "Auto-detect ang Aking Lokasyon",
    "location.save": "I-save ang Lokasyon",
    "location.select.municipality": "Pumili ng Munispalidad",
    "location.select.barangay": "Pumili ng Barangay",
    "location.permission.title": "Location Permission",
    "location.permission.message": "Kailangan ang permission para auto-detect ang inyong lokasyon.",
    "location.auto.detect.failed": "Nabigo ang auto-detect",
    "personalization.title": "Personalization",
    "personalization.question": "Ano ang inyong itinatanim?",
    "personalization.instruction": "Pumili ng lahat na naaangkop para makakuha ng personalized na weather alerts para sa inyong mga tanim.",
    "personalization.selected": "Napili",
    "personalization.finish": "Tapusin",
    "planting.title": "Itakda ang Planting Dates",
    "planting.info": "Itakda ang planting dates para sa inyong mga tanim upang awtomatikong makagawa ng daily farming tasks.",
    "planting.no.crops": "Walang Napiling Tanim",
    "planting.no.crops.desc": "Mangyaring pumili muna ng mga tanim sa Personalization.",
    "planting.duration": "Tagal: {{days}} araw",
    "planting.set.date": "Itakda ang Planting Date",
    "planting.edit.date": "I-edit ang Planting Date",
    "suggestions.title": "Mga Mungkahi sa Pagsasaka",
    "suggestions.loading": "Naglo-load ng mga mungkahi sa panahon...",
    "suggestions.error": "Error",
    "common.back": "Bumalik",
    "common.save": "I-save",
    "common.cancel": "Kanselahin",
    "common.ok": "OK",
    "common.retry": "Subukan ulit",
    "common.skip": "Laktawan",
    "common.next": "Susunod",
    "common.finish": "Tapusin",
  },
};

