import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Cloud, Droplets, Wind, Thermometer, Eye, Gauge } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  description: string;
  visibility: number;
  cloudCover: number;
  monthlyRainfall: { month: string; rainfall: number }[];
}

const WeatherDashboard = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const fetchWeather = async (loc?: string) => {
    const searchLocation = loc || location;
    if (!searchLocation) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("get-weather", {
        body: { location: searchLocation },
      });

      if (error) throw error;

      setWeather(data);
      toast({
        title: t("weather.weatherUpdated"),
        description: `${t("weather.fetchedData")} ${data.location}`,
      });
    } catch (error) {
      console.error("Weather fetch error:", error);
      toast({
        title: t("weather.weatherFailed"),
        description: t("weather.unableToFetch"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather();
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary" />
          {t("weather.title")}
        </CardTitle>
        <CardDescription>
          {t("weather.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="location">{t("weather.location")}</Label>
              <Input
                id="location"
                type="text"
                placeholder={t("weather.enterLocation")}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("weather.loading")}
                  </>
                ) : (
                  t("weather.getWeather")
                )}
              </Button>
            </div>
          </div>
        </form>

        {weather && (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <h3 className="text-2xl font-bold mb-1">{weather.location}</h3>
              <p className="text-sm text-muted-foreground capitalize mb-4">{weather.description}</p>
              <div className="flex items-center gap-2">
                <Thermometer className="h-8 w-8 text-primary" />
                <span className="text-5xl font-bold">{weather.temperature}°C</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {t("weather.feelsLike")} {weather.feelsLike}°C
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-card border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{t("weather.humidity")}</span>
                </div>
                <p className="text-2xl font-bold">{weather.humidity}%</p>
              </div>

              <div className="p-4 bg-card border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{t("weather.windSpeed")}</span>
                </div>
                <p className="text-2xl font-bold">{weather.windSpeed} m/s</p>
              </div>

              <div className="p-4 bg-card border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{t("weather.pressure")}</span>
                </div>
                <p className="text-2xl font-bold">{weather.pressure} hPa</p>
              </div>

              <div className="p-4 bg-card border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{t("weather.visibility")}</span>
                </div>
                <p className="text-2xl font-bold">{(weather.visibility / 1000).toFixed(1)} km</p>
              </div>

              <div className="p-4 bg-card border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{t("weather.cloudCover")}</span>
                </div>
                <p className="text-2xl font-bold">{weather.cloudCover}%</p>
              </div>

            </div>

            {weather.monthlyRainfall && weather.monthlyRainfall.length > 0 && (
              <div className="p-4 bg-card border rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Droplets className="h-5 w-5 text-primary" />
                  <span className="text-lg font-semibold">{t("weather.monthlyRainfall")}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {weather.monthlyRainfall.map((data, index) => (
                    <div key={index} className="text-center p-2 bg-primary/5 rounded">
                      <p className="text-xs text-muted-foreground mb-1">{data.month}</p>
                      <p className="text-sm font-bold">{data.rainfall} mm</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherDashboard;
