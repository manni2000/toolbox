import { useState, useEffect } from "react";
import { Globe, Clock, RefreshCw, Search, MapPin, Sunrise, Sunset, Eye, EyeOff, Filter, Star, TrendingUp, Users, Calendar, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "220 80% 55%";

interface TimeZone {
  id: string;
  name: string;
  city: string;
  country: string;
  offset: number; // UTC offset in hours
  flag: string;
  region: string;
  popularity: number;
}

interface TimeData {
  time: string;
  date: string;
  timezone: string;
  isDaylight: boolean;
  utcOffset: string;
  dayOfWeek: string;
  timeDifference: string;
}

const WorldTimeTool = () => {
  const toolSeoData = getToolSeoMetadata('world-time');
  const [timezones, setTimezones] = useState<TimeZone[]>([
    { id: "UTC", name: "UTC", city: "Universal", country: "World", offset: 0, flag: "🌍", region: "Global", popularity: 100 },
    { id: "EST", name: "Eastern Time", city: "New York", country: "USA", offset: -5, flag: "🇺🇸", region: "Americas", popularity: 95 },
    { id: "CST", name: "Central Time", city: "Chicago", country: "USA", offset: -6, flag: "🇺🇸", region: "Americas", popularity: 85 },
    { id: "MST", name: "Mountain Time", city: "Denver", country: "USA", offset: -7, flag: "🇺🇸", region: "Americas", popularity: 75 },
    { id: "PST", name: "Pacific Time", city: "Los Angeles", country: "USA", offset: -8, flag: "🇺🇸", region: "Americas", popularity: 90 },
    { id: "GMT", name: "Greenwich Mean Time", city: "London", country: "UK", offset: 0, flag: "🇬🇧", region: "Europe", popularity: 88 },
    { id: "CET", name: "Central European Time", city: "Paris", country: "France", offset: 1, flag: "🇫🇷", region: "Europe", popularity: 82 },
    { id: "EET", name: "Eastern European Time", city: "Athens", country: "Greece", offset: 2, flag: "🇬🇷", region: "Europe", popularity: 70 },
    { id: "MSK", name: "Moscow Time", city: "Moscow", country: "Russia", offset: 3, flag: "🇷🇺", region: "Europe", popularity: 75 },
    { id: "IST", name: "India Standard Time", city: "New Delhi", country: "India", offset: 5.5, flag: "🇮🇳", region: "Asia", popularity: 92 },
    { id: "CST-China", name: "China Standard Time", city: "Beijing", country: "China", offset: 8, flag: "🇨🇳", region: "Asia", popularity: 85 },
    { id: "JST", name: "Japan Standard Time", city: "Tokyo", country: "Japan", offset: 9, flag: "🇯🇵", region: "Asia", popularity: 80 },
    { id: "AEST", name: "Australian Eastern Time", city: "Sydney", country: "Australia", offset: 10, flag: "🇦🇺", region: "Oceania", popularity: 78 },
    { id: "NZST", name: "New Zealand Time", city: "Auckland", country: "New Zealand", offset: 12, flag: "🇳🇿", region: "Oceania", popularity: 65 },
    { id: "HST", name: "Hawaii Standard Time", city: "Honolulu", country: "USA", offset: -10, flag: "🇺🇸", region: "Americas", popularity: 60 },
    { id: "AKST", name: "Alaska Time", city: "Anchorage", country: "USA", offset: -9, flag: "🇺🇸", region: "Americas", popularity: 55 },
    { id: "BRST", name: "Brasilia Time", city: "São Paulo", country: "Brazil", offset: -3, flag: "🇧🇷", region: "Americas", popularity: 72 },
    { id: "ART", name: "Argentina Time", city: "Buenos Aires", country: "Argentina", offset: -3, flag: "🇦🇷", region: "Americas", popularity: 68 },
    { id: "SAST", name: "South Africa Time", city: "Johannesburg", country: "South Africa", offset: 2, flag: "🇿🇦", region: "Africa", popularity: 70 },
    { id: "EAT", name: "East Africa Time", city: "Nairobi", country: "Kenya", offset: 3, flag: "🇰🇪", region: "Africa", popularity: 65 },
    { id: "PKT", name: "Pakistan Time", city: "Karachi", country: "Pakistan", offset: 5, flag: "🇵🇰", region: "Asia", popularity: 62 },
    { id: "BDT", name: "Bangladesh Time", city: "Dhaka", country: "Bangladesh", offset: 6, flag: "🇧🇩", region: "Asia", popularity: 58 },
    { id: "WIB", name: "Western Indonesia Time", city: "Jakarta", country: "Indonesia", offset: 7, flag: "🇮🇩", region: "Asia", popularity: 60 },
    { id: "ICT", name: "Indochina Time", city: "Bangkok", country: "Thailand", offset: 7, flag: "🇹🇭", region: "Asia", popularity: 64 },
    { id: "KST", name: "Korea Standard Time", city: "Seoul", country: "South Korea", offset: 9, flag: "🇰🇷", region: "Asia", popularity: 76 },
    { id: "MUT", name: "Mauritius Time", city: "Port Louis", country: "Mauritius", offset: 4, flag: "🇲🇺", region: "Africa", popularity: 52 },
    { id: "CAT", name: "Central Africa Time", city: "Kinshasa", country: "DRC", offset: 2, flag: "🇨🇩", region: "Africa", popularity: 55 },
    { id: "WAT", name: "West Africa Time", city: "Lagos", country: "Nigeria", offset: 1, flag: "🇳🇬", region: "Africa", popularity: 67 },
  ]);

  const [currentTime, setCurrentTime] = useState<Record<string, TimeData>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [is24Hour, setIs24Hour] = useState(true);
  const [showSeconds, setShowSeconds] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "offset" | "popularity">("name");
  const [favorites, setFavorites] = useState<string[]>(["UTC", "EST", "IST"]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const regions = ["all", "Americas", "Europe", "Asia", "Africa", "Oceania"];

  const getTimeForTimezone = (timezone: TimeZone): TimeData => {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localTime = new Date(utcTime + (timezone.offset * 3600000));
    
    const hours = localTime.getHours();
    const isDaylight = hours >= 6 && hours < 18;
    
    const formatTime = (date: Date) => {
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const period = hours >= 12 ? 'PM' : 'AM';
      
      if (!is24Hour) {
        hours = hours % 12 || 12;
      }
      
      const timeString = showSeconds
        ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}${!is24Hour ? ` ${period}` : ''}`
        : `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}${!is24Hour ? ` ${period}` : ''}`;
      
      return timeString;
    };
    
    const formatDate = (date: Date) => {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
      return date.toLocaleDateString('en-US', options);
    };
    
    const getDayOfWeek = (date: Date) => {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    };
    
    const getUTCOffset = (offset: number) => {
      const sign = offset >= 0 ? '+' : '';
      const hours = Math.floor(Math.abs(offset));
      const minutes = (Math.abs(offset) % 1) * 60;
      return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };
    
    const getTimeDifference = (offset: number) => {
      const userOffset = -new Date().getTimezoneOffset() / 60;
      const diff = offset - userOffset;
      if (diff === 0) return "Same as local";
      const sign = diff > 0 ? '+' : '';
      return `${sign}${diff} hours`;
    };
    
    return {
      time: formatTime(localTime),
      date: formatDate(localTime),
      timezone: timezone.name,
      isDaylight,
      utcOffset: getUTCOffset(timezone.offset),
      dayOfWeek: getDayOfWeek(localTime),
      timeDifference: getTimeDifference(timezone.offset)
    };
  };

  const toggleFavorite = (timezoneId: string) => {
    setFavorites(prev => 
      prev.includes(timezoneId) 
        ? prev.filter(id => id !== timezoneId)
        : [...prev, timezoneId]
    );
  };

  const filteredAndSortedTimezones = timezones
    .filter(tz => {
      if (showFavoritesOnly && !favorites.includes(tz.id)) return false;
      if (selectedRegion !== "all" && tz.region !== selectedRegion) return false;
      return tz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             tz.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
             tz.country.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "offset") return a.offset - b.offset;
      if (sortBy === "popularity") return b.popularity - a.popularity;
      return 0;
    });

  useEffect(() => {
    const updateTimes = () => {
      const newTimes: Record<string, TimeData> = {};
      timezones.forEach(tz => {
        newTimes[tz.id] = getTimeForTimezone(tz);
      });
      setCurrentTime(newTimes);
      setLastUpdated(new Date());
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    
    return () => clearInterval(interval);
  }, [timezones, is24Hour, showSeconds]);

  const handleRefresh = () => {
    const newTimes: Record<string, TimeData> = {};
    timezones.forEach(tz => {
      newTimes[tz.id] = getTimeForTimezone(tz);
    });
    setCurrentTime(newTimes);
    setLastUpdated(new Date());
  };

  const popularTimezones = timezones.filter(tz => tz.popularity >= 85).slice(0, 4);

  return (
    <>
      {CategorySEO.DateTime(
        toolSeoData?.title || "World Time",
        toolSeoData?.description || "View current time across different time zones worldwide with real-time updates and advanced features",
        "world-time"
      )}
      <ToolLayout
      breadcrumbTitle="World Time"
      category="Date & Time"
      categoryPath="/category/date-time"
    >
      <div className="space-y-6">
        {/* Keyword Tags Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-muted/50 via-background to-muted/30 rounded-xl border border-border p-6"
        >
          <div className="relative flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: `hsl(${categoryColor} / 0.15)`,
                boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)`,
              }}
            >
              <Globe className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">World Time Free Online</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                View current time across different time zones worldwide with real-time updates and advanced features.
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">world time</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">time zone converter</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">world clock</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">time zones</span>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Enhanced Header */}
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-primary/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Professional World Clock</h3>
                <p className="text-sm text-muted-foreground">
                  {timezones.length} time zones • Real-time updates • Advanced filtering
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                <span>Live</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{lastUpdated.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Total Zones</span>
            </div>
            <div className="text-2xl font-bold text-primary">{timezones.length}</div>
            <div className="text-xs text-muted-foreground">Across all continents</div>
          </div>
          
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Favorites</span>
            </div>
            <div className="text-2xl font-bold text-primary">{favorites.length}</div>
            <div className="text-xs text-muted-foreground">Quick access zones</div>
          </div>
          
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Popular</span>
            </div>
            <div className="text-2xl font-bold text-primary">{timezones.filter(tz => tz.popularity >= 85).length}</div>
            <div className="text-xs text-muted-foreground">High usage zones</div>
          </div>
          
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Active</span>
            </div>
            <div className="text-2xl font-bold text-primary">{Object.keys(currentTime).length}</div>
            <div className="text-xs text-muted-foreground">Live updates</div>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search time zones, cities, or countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12 w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  title="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-3">
              {/* Region Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  title="Filter by region"
                  aria-label="Filter time zones by region"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="input-field px-3 py-1 text-sm"
                >
                  {regions.map(region => (
                    <option key={region} value={region}>
                      {region === "all" ? "All Regions" : region}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort:</span>
                <select
                  title="Sort time zones"
                  aria-label="Sort time zones"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "name" | "offset" | "popularity")}
                  className="input-field px-3 py-1 text-sm"
                >
                  <option value="name">Name</option>
                  <option value="offset">Time Offset</option>
                  <option value="popularity">Popularity</option>
                </select>
              </div>

              {/* Favorites Toggle */}
              <button
                type="button"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                  showFavoritesOnly
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <Star className="h-3 w-3" />
                Favorites Only
              </button>
            </div>

            {/* Display Options */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIs24Hour(!is24Hour)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                  is24Hour
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <Clock className="h-3 w-3" />
                {is24Hour ? "24H" : "12H"}
              </button>
              
              <button
                type="button"
                onClick={() => setShowSeconds(!showSeconds)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                  showSeconds
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <span className="text-xs">:00</span>
                Seconds
              </button>
              
              <button
                type="button"
                onClick={handleRefresh}
                className="flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Popular Timezones */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5" />
            Popular Time Zones
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularTimezones.map((timezone) => {
              const timeData = currentTime[timezone.id];
              if (!timeData) return null;

              return (
                <div
                  key={timezone.id}
                  className="rounded-xl border border-primary/20 bg-primary/5 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{timezone.flag}</span>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{timezone.name}</h4>
                        <p className="text-xs text-muted-foreground">{timezone.city}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(timezone.id)}
                      aria-label={`Add ${timezone.name} to favorites`}
                      title={`Add ${timezone.name} to favorites`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Star className={`h-4 w-4 ${favorites.includes(timezone.id) ? 'fill-primary text-primary' : ''}`} />
                    </button>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">{timeData.time}</div>
                    <div className="text-xs text-muted-foreground">{timeData.utcOffset}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All Timezones */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Globe className="h-5 w-5" />
              All Time Zones
              <span className="text-sm text-muted-foreground">({filteredAndSortedTimezones.length} results)</span>
            </h3>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSortedTimezones.map((timezone) => {
              const timeData = currentTime[timezone.id];
              if (!timeData) return null;

              return (
                <div
                  key={timezone.id}
                  className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{timezone.flag}</span>
                      <div>
                        <h4 className="font-semibold text-foreground">{timezone.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {timezone.city}, {timezone.country}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {timezone.region}
                          </span>
                          {timezone.popularity >= 85 && (
                            <span className="text-xs bg-orange-10 text-orange-600 px-2 py-0.5 rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(timezone.id)}
                      aria-label={`${favorites.includes(timezone.id) ? "Remove" : "Add"} ${timezone.name} from favorites`}
                      title={`${favorites.includes(timezone.id) ? "Remove" : "Add"} ${timezone.name} from favorites`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Star className={`h-4 w-4 ${favorites.includes(timezone.id) ? 'fill-primary text-primary' : ''}`} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {timeData.isDaylight ? (
                          <Sunrise className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <Sunset className="h-4 w-4 text-blue-500" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {timeData.isDaylight ? 'Day' : 'Night'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {timeData.dayOfWeek}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {timeData.time}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {timeData.date}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{timeData.utcOffset}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{timeData.timeDifference}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Tips */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Pro Tips & Features
          </h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h5 className="font-medium text-foreground mb-2">⭐ Favorites</h5>
              <p className="text-sm text-muted-foreground">
                Star your most-used time zones for quick access
              </p>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">🔍 Advanced Search</h5>
              <p className="text-sm text-muted-foreground">
                Search by timezone name, city, or country
              </p>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">🌍 Regional Filter</h5>
              <p className="text-sm text-muted-foreground">
                Filter time zones by continent or region
              </p>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">⏰ Live Updates</h5>
              <p className="text-sm text-muted-foreground">
                Real-time updates every second automatically
              </p>
            </div>
          </div>
        </div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            What is World Time?
          </h3>
          <p className="text-muted-foreground mb-4">
            World Time displays current times across different time zones worldwide. It helps you coordinate meetings, schedule international calls, and stay connected with friends and colleagues across the globe by showing real-time clocks for multiple locations.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Search for cities or time zones by name</li>
            <li>Add multiple locations to your dashboard</li>
            <li>View real-time clocks with UTC offsets</li>
            <li>Filter by region or mark favorites</li>
            <li>Times update automatically every second</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Key Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Real-time clock updates</li>
                <li>• Search by city/country</li>
                <li>• Regional filtering</li>
                <li>• Favorite time zones</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• International meetings</li>
                <li>• Travel planning</li>
                <li>• Remote team coordination</li>
                <li>• Event scheduling</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What is world time?",
            answer: "World time displays current times across different time zones worldwide. It helps you coordinate meetings, schedule international calls, and stay connected with friends and colleagues across the globe by showing real-time clocks for multiple locations."
          },
          {
            question: "How does the world time tool work?",
            answer: "Search for cities or time zones by name. The tool displays real-time clocks with UTC offsets for multiple locations. You can filter by region, mark favorites, and view day/night indicators. Times update automatically every second."
          },
          {
            question: "How accurate are the displayed times?",
            answer: "Times are updated every second based on your browser's clock and the UTC offset for each time zone. This ensures accuracy within seconds."
          },
          {
            question: "Can I add multiple time zones?",
            answer: "Yes, you can add as many time zones as you need. Search for cities or countries and add them to your dashboard for easy comparison."
          },
          {
            question: "What is UTC offset?",
            answer: "UTC offset is the time difference between a location and Coordinated Universal Time (UTC). Positive offsets are ahead of UTC, negative offsets are behind."
          },
          {
            question: "Does it account for daylight saving time?",
            answer: "The tool displays current time based on standard time zones. Some regions observe daylight saving time, which may cause temporary shifts from standard offsets."
          },
          {
            question: "Can I save my favorite time zones?",
            answer: "Yes, you can star time zones as favorites to keep them easily accessible at the top of your list for quick reference."
          }
        ]} />
        </div>
      </div>
    </ToolLayout>
      </>
  );
};

export default WorldTimeTool;
