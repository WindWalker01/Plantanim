import AsyncStorage from "@react-native-async-storage/async-storage";

export type Coordinates = { latitude: number; longitude: number };

export type HourlyForecastItem = {
  timeLabel: string;
  temperature: number;
  icon: string;
  isNow?: boolean;
};

export type DailyForecastItem = {
  dayLabel: string;
  dateISO: string;
  icon: string;
  precipitation: number | null;
  high: number;
  low: number;
};

export type CurrentWeather = {
  dateLabel: string;
  temperature: number;
  apparentTemperature: number | null;
  windSpeedKmh: number | null;
  windDirection: number | null;
  icon: string;
  summary: string;
};

export const MUNICIPALITY_COORDS: Record<string, Coordinates> = {
  Abucay: { latitude: 14.7357, longitude: 120.5332 },
  Bagac: { latitude: 14.6019, longitude: 120.4015 },
  "Balanga City": { latitude: 14.676, longitude: 120.5389 },
  Dinalupihan: { latitude: 14.8797, longitude: 120.4656 },
  Hermosa: { latitude: 14.8283, longitude: 120.5498 },
  Limay: { latitude: 14.5634, longitude: 120.5984 },
  Mariveles: { latitude: 14.4333, longitude: 120.4833 },
  Morong: { latitude: 14.7062, longitude: 120.2663 },
  Orani: { latitude: 14.8, longitude: 120.5333 },
  Orion: { latitude: 14.6203, longitude: 120.5814 },
  Pilar: { latitude: 14.6656, longitude: 120.565 },
  Samal: { latitude: 14.7667, longitude: 120.542 },
};

const DEFAULT_COORDS: Coordinates = { latitude: 14.676, longitude: 120.5389 }; // Balanga City, Bataan

const STORAGE_KEY = "@plantanim:user_location";

const formatHourLabel = (dateString: string) => {
  const date = new Date(dateString);
  const hours = date.getHours();
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12} ${suffix}`;
};

const formatDayLabel = (dateString: string, index: number) => {
  if (index === 0) return "Today";
  return new Date(dateString).toLocaleDateString(undefined, { weekday: "short" });
};

const weatherCodeToIcon = (code: number): string => {
  if (code === 0) return "wb-sunny";
  if (code === 1 || code === 2 || code === 3) return "wb-cloudy";
  if (code === 45 || code === 48) return "blur-on";
  if (code === 51 || code === 53 || code === 55) return "grain";
  if (code === 56 || code === 57) return "ac-unit";
  if (code === 61 || code === 63 || code === 65) return "grain";
  if (code === 66 || code === 67) return "ac-unit";
  if (code === 71 || code === 73 || code === 75) return "ac-unit";
  if (code === 77) return "ac-unit";
  if (code === 80 || code === 81 || code === 82) return "grain";
  if (code === 85 || code === 86) return "ac-unit";
  if (code === 95 || code === 96 || code === 99) return "flash-on";
  return "wb-cloudy";
};

const weatherCodeToSummary = (code: number): string => {
  if (code === 0) return "Clear sky";
  if (code === 1 || code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Foggy conditions";
  if (code === 51 || code === 53 || code === 55) return "Light drizzle";
  if (code === 56 || code === 57) return "Freezing drizzle";
  if (code === 61 || code === 63 || code === 65) return "Rain showers";
  if (code === 66 || code === 67) return "Freezing rain";
  if (code === 71 || code === 73 || code === 75) return "Snowfall";
  if (code === 80 || code === 81 || code === 82) return "Heavy rain showers";
  if (code === 95) return "Thunderstorm";
  if (code === 96 || code === 99) return "Thunderstorm with hail";
  return "Changing conditions";
};

async function getCoordinates(): Promise<Coordinates> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { municipality } = JSON.parse(saved);
      if (municipality && MUNICIPALITY_COORDS[municipality]) {
        return MUNICIPALITY_COORDS[municipality];
      }
    }
  } catch (error) {
    console.error("Error reading saved location:", error);
  }
  return DEFAULT_COORDS;
}

export async function fetchWeatherForecast() {
  const coords = await getCoordinates();
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&hourly=temperature_2m,precipitation_probability,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&current_weather=true&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }
  const data = await response.json();

  const hourly: HourlyForecastItem[] = [];
  const now = Date.now();
  const hourlyTimes: string[] = data.hourly?.time || [];
  const temperatures: number[] = data.hourly?.temperature_2m || [];
  const weatherCodes: number[] = data.hourly?.weathercode || [];

  const startIndex = hourlyTimes.findIndex((t) => new Date(t).getTime() >= now);
  const start = startIndex >= 0 ? startIndex : 0;

  for (let i = start; i < Math.min(hourlyTimes.length, start + 8); i++) {
    hourly.push({
      timeLabel: i === start ? "Now" : formatHourLabel(hourlyTimes[i]),
      temperature: Math.round(temperatures[i]),
      icon: weatherCodeToIcon(weatherCodes[i]),
      isNow: i === start,
    });
  }

  const daily: DailyForecastItem[] = [];
  const dailyTimes: string[] = data.daily?.time || [];
  const dailyMax: number[] = data.daily?.temperature_2m_max || [];
  const dailyMin: number[] = data.daily?.temperature_2m_min || [];
  const dailyCodes: number[] = data.daily?.weathercode || [];
  const precipMax: number[] = data.daily?.precipitation_probability_max || [];

  for (let i = 0; i < Math.min(dailyTimes.length, 7); i++) {
    daily.push({
      dayLabel: formatDayLabel(dailyTimes[i], i),
      dateISO: dailyTimes[i],
      icon: weatherCodeToIcon(dailyCodes[i]),
      precipitation: Number.isFinite(precipMax[i]) ? Math.round(precipMax[i]) : null,
      high: Math.round(dailyMax[i]),
      low: Math.round(dailyMin[i]),
    });
  }

  // current weather
  const cw = data.current_weather;
  const currentWeather: CurrentWeather | null = cw
    ? {
        dateLabel: new Date(cw.time).toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        temperature: Math.round(cw.temperature),
        apparentTemperature: data.current_weather_units?.apparent_temperature
          ? Math.round(cw.apparent_temperature ?? cw.temperature)
          : null,
        windSpeedKmh: typeof cw.windspeed === "number" ? Math.round(cw.windspeed) : null,
        windDirection: typeof cw.winddirection === "number" ? cw.winddirection : null,
        icon: weatherCodeToIcon(cw.weathercode),
        summary: weatherCodeToSummary(cw.weathercode),
      }
    : null;

  return { hourly, daily, currentWeather };
}
