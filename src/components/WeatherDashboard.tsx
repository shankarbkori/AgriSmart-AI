import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Cloud, Droplets, Wind, Thermometer, Eye, Gauge, MapPin } from "lucide-react";

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
  currentRainfall: number;
  monthlyRainfall: { month: string; rainfall: number }[];
  avgMonthlyRainfall?: number;
}

const WeatherDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const fetchWeather = async (loc?: string, latitude?: number, longitude?: number) => {
    const searchLocation = loc || location;
    if (!searchLocation && !latitude && !longitude) {
      toast({
        title: "Location Required",
        description: "Please enter a location or use your current location",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const body = latitude && longitude 
        ? { lat: latitude, lon: longitude }
        : { location: searchLocation };

      const { data, error } = await supabase.functions.invoke("get-weather", {
        body,
      });

      if (error) throw error;

      // Calculate average monthly rainfall (same as crop recommendation/yield prediction)
      let avgMonthlyRainfall = 75; // default
      if (data.monthlyRainfall && Array.isArray(data.monthlyRainfall)) {
        const total = data.monthlyRainfall.reduce((sum: number, item: any) => sum + item.rainfall, 0);
        avgMonthlyRainfall = Math.round(total / data.monthlyRainfall.length);
      }

      setWeather({ ...data, avgMonthlyRainfall });
      toast({
        title: "Weather Updated",
        description: `Fetched latest weather data for ${data.location}`,
      });
    } catch (error) {
      console.error("Weather fetch error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unable to fetch weather data. Please try again.";
      toast({
        title: "Weather Fetch Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(undefined, position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setLoading(false);
        toast({
          title: "Location Access Denied",
          description: "Please allow location access or enter a location manually",
          variant: "destructive",
        });
      }
    );
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
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                type="text"
                placeholder="City name, region, or country (e.g., Tokyo, Sahara Desert, Antarctica)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1"
              />
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
              <Button 
                type="button" 
                variant="outline" 
                onClick={useCurrentLocation}
                disabled={loading}
                title="Use my current location"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Supports cities, regions, and coordinates from anywhere in the world
            </p>
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
                  <span className="text-sm font-medium">Rainfall</span>
                </div>
                <p className="text-2xl font-bold">{weather.avgMonthlyRainfall || 75} mm</p>
                <p className="text-sm text-muted-foreground mt-1">Avg monthly</p>
              </div>

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
