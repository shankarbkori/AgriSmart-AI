import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Cloud, Droplets, Wind, Thermometer, Eye, Gauge } from "lucide-react";

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
}

const WeatherDashboard = () => {
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
        title: "Weather Updated",
        description: `Fetched latest weather data for ${data.location}`,
      });
    } catch (error) {
      console.error("Weather fetch error:", error);
      toast({
        title: "Weather Fetch Failed",
        description: "Unable to fetch weather data. Please try again.",
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
          Real-Time Weather Updates
        </CardTitle>
        <CardDescription>
          Get current weather conditions to make informed farming decisions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                placeholder="Enter city name or coordinates"
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
                    Loading...
                  </>
                ) : (
                  "Get Weather"
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
                Feels like {weather.feelsLike}°C
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-card border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Humidity</span>
                </div>
                <p className="text-2xl font-bold">{weather.humidity}%</p>
              </div>

              <div className="p-4 bg-card border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Wind Speed</span>
                </div>
                <p className="text-2xl font-bold">{weather.windSpeed} m/s</p>
              </div>

              <div className="p-4 bg-card border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Pressure</span>
                </div>
                <p className="text-2xl font-bold">{weather.pressure} hPa</p>
              </div>

              <div className="p-4 bg-card border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Visibility</span>
                </div>
                <p className="text-2xl font-bold">{(weather.visibility / 1000).toFixed(1)} km</p>
              </div>

              <div className="p-4 bg-card border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Cloud Cover</span>
                </div>
                <p className="text-2xl font-bold">{weather.cloudCover}%</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherDashboard;
