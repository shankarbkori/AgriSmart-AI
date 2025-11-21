import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Leaf, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CropRecommendation {
  crop: string;
  confidence: number;
  reason: string;
}

const CropRecommendation = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [formData, setFormData] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
    season: "",
  });

  const detectSeason = (latitude: number) => {
    const month = new Date().getMonth(); // 0-11 (Jan=0, Dec=11)
    const isNorthern = latitude >= 0;
    
    // For Indian subcontinent - use agricultural seasons
    if (latitude >= 8 && latitude <= 37) {
      // Monsoon/Kharif: June to September (months 5-8)
      if (month >= 5 && month <= 8) return "monsoon";
      // Winter/Rabi: October to February (months 9-11, 0-1)
      if (month >= 9 || month <= 1) return "winter";
      // Summer/Zaid: March to May (months 2-4)
      return "summer";
    }
    
    // For other regions - standard meteorological seasons
    if (isNorthern) {
      // Winter: Dec, Jan, Feb (months 11, 0, 1)
      if (month === 11 || month <= 1) return "winter";
      // Spring: Mar, Apr, May (months 2, 3, 4)
      if (month >= 2 && month <= 4) return "spring";
      // Summer: Jun, Jul, Aug (months 5, 6, 7)
      if (month >= 5 && month <= 7) return "summer";
      // Autumn: Sep, Oct, Nov (months 8, 9, 10)
      return "autumn";
    } else {
      // Southern hemisphere (reversed)
      if (month === 11 || month <= 1) return "summer";
      if (month >= 2 && month <= 4) return "autumn";
      if (month >= 5 && month <= 7) return "winter";
      return "spring";
    }
  };

  const fetchLocationData = async () => {
    setFetchingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      const { data, error } = await supabase.functions.invoke("get-weather", {
        body: { lat: latitude, lon: longitude },
      });

      if (error) throw error;

      // Calculate average monthly rainfall
      let avgRainfall = 75; // default
      if (data.monthlyRainfall && Array.isArray(data.monthlyRainfall)) {
        const total = data.monthlyRainfall.reduce((sum: number, item: any) => sum + item.rainfall, 0);
        avgRainfall = Math.round(total / data.monthlyRainfall.length);
      }

      const season = detectSeason(latitude);

      setFormData(prev => ({
        ...prev,
        temperature: data.temperature.toString(),
        humidity: data.humidity.toString(),
        rainfall: avgRainfall.toString(),
        ph: "6.5", // Neutral pH as default
        season: season,
      }));

      toast({
        title: "Location Data Loaded",
        description: "Weather data, rainfall, pH, and season auto-populated based on your location.",
      });
    } catch (error) {
      console.error("Location error:", error);
      toast({
        title: "Location Access Failed",
        description: "Unable to fetch location data. Please enter values manually.",
        variant: "destructive",
      });
    } finally {
      setFetchingLocation(false);
    }
  };

  useEffect(() => {
    fetchLocationData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRecommendations([]);

    try {
      const { data, error } = await supabase.functions.invoke("recommend-crops", {
        body: formData,
      });

      if (error) throw error;

      setRecommendations(data.recommendations);
      toast({
        title: "Recommendations Generated",
        description: `Found ${data.recommendations.length} suitable crops`,
      });
    } catch (error) {
      console.error("Recommendation error:", error);
      toast({
        title: "Recommendation Failed",
        description: "Unable to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              Crop Recommendation System
            </CardTitle>
            <CardDescription>
              Get intelligent crop suggestions based on soil conditions, climate, and season
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLocationData}
            disabled={fetchingLocation}
          >
            {fetchingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Refresh Location
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nitrogen">Nitrogen (N) - kg/ha</Label>
              <Input
                id="nitrogen"
                type="number"
                step="0.1"
                placeholder="e.g., 50"
                value={formData.nitrogen}
                onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phosphorus">Phosphorus (P) - kg/ha</Label>
              <Input
                id="phosphorus"
                type="number"
                step="0.1"
                placeholder="e.g., 30"
                value={formData.phosphorus}
                onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="potassium">Potassium (K) - kg/ha</Label>
              <Input
                id="potassium"
                type="number"
                step="0.1"
                placeholder="e.g., 40"
                value={formData.potassium}
                onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="e.g., 25"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="humidity">Humidity (%)</Label>
              <Input
                id="humidity"
                type="number"
                step="0.1"
                placeholder="e.g., 65"
                value={formData.humidity}
                onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ph">Soil pH</Label>
              <Input
                id="ph"
                type="number"
                step="0.1"
                placeholder="e.g., 6.5"
                value={formData.ph}
                onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rainfall">Rainfall (mm)</Label>
              <Input
                id="rainfall"
                type="number"
                step="0.1"
                placeholder="e.g., 800"
                value={formData.rainfall}
                onChange={(e) => setFormData({ ...formData, rainfall: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="season">Season</Label>
              <Select
                value={formData.season}
                onValueChange={(value) => setFormData({ ...formData, season: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summer">Summer</SelectItem>
                  <SelectItem value="winter">Winter</SelectItem>
                  <SelectItem value="monsoon">Monsoon</SelectItem>
                  <SelectItem value="spring">Spring</SelectItem>
                  <SelectItem value="autumn">Autumn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Get Recommendations"
            )}
          </Button>
        </form>

        {recommendations.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-lg">Recommended Crops</h3>
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="p-4 bg-card border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-lg capitalize">{rec.crop}</h4>
                  <Badge variant="secondary">
                    {(rec.confidence * 100).toFixed(0)}% match
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{rec.reason}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CropRecommendation;
