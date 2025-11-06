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
import { useTranslation } from "react-i18next";

interface CropRecommendation {
  crop: string;
  confidence: number;
  reason: string;
}

const CropRecommendation = () => {
  const { t } = useTranslation();
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

      setFormData(prev => ({
        ...prev,
        temperature: data.temperature.toString(),
        humidity: data.humidity.toString(),
        rainfall: data.rainfall.toString(),
      }));

      toast({
        title: t("cropRecommendation.locationDataLoaded"),
        description: t("cropRecommendation.weatherAutoPopulated"),
      });
    } catch (error) {
      console.error("Location error:", error);
      toast({
        title: t("cropRecommendation.locationAccessFailed"),
        description: t("cropRecommendation.enterManually"),
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
        title: t("cropRecommendation.recommendationsGenerated"),
        description: t("cropRecommendation.foundCrops").replace("{count}", data.recommendations.length),
      });
    } catch (error) {
      console.error("Recommendation error:", error);
      toast({
        title: t("cropRecommendation.recommendationFailed"),
        description: t("cropRecommendation.unableToGenerate"),
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
              {t("cropRecommendation.title")}
            </CardTitle>
            <CardDescription>
              {t("cropRecommendation.description")}
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
                {t("cropRecommendation.refreshLocation")}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nitrogen">{t("cropRecommendation.nitrogen")}</Label>
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
              <Label htmlFor="phosphorus">{t("cropRecommendation.phosphorus")}</Label>
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
              <Label htmlFor="potassium">{t("cropRecommendation.potassium")}</Label>
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
              <Label htmlFor="temperature">{t("cropRecommendation.temperature")}</Label>
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
              <Label htmlFor="humidity">{t("cropRecommendation.humidity")}</Label>
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
              <Label htmlFor="ph">{t("cropRecommendation.ph")}</Label>
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
              <Label htmlFor="rainfall">{t("cropRecommendation.rainfall")}</Label>
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
              <Label htmlFor="season">{t("cropRecommendation.season")}</Label>
              <Select
                value={formData.season}
                onValueChange={(value) => setFormData({ ...formData, season: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("cropRecommendation.selectSeason")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summer">{t("cropRecommendation.summer")}</SelectItem>
                  <SelectItem value="winter">{t("cropRecommendation.winter")}</SelectItem>
                  <SelectItem value="monsoon">{t("cropRecommendation.monsoon")}</SelectItem>
                  <SelectItem value="spring">{t("cropRecommendation.spring")}</SelectItem>
                  <SelectItem value="autumn">{t("cropRecommendation.autumn")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("cropRecommendation.analyzing")}
              </>
            ) : (
              t("cropRecommendation.getRecommendations")
            )}
          </Button>
        </form>

        {recommendations.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-lg">{t("cropRecommendation.recommendedCrops")}</h3>
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="p-4 bg-card border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-lg capitalize">{rec.crop}</h4>
                  <Badge variant="secondary">
                    {(rec.confidence * 100).toFixed(0)}% {t("cropRecommendation.match")}
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
