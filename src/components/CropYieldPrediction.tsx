import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, MapPin } from "lucide-react";

const CropYieldPrediction = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    cropType: "",
    area: "",
    rainfall: "",
    fertilizer: "",
    pesticide: "",
    temperature: "",
    humidity: "",
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
      }));

      toast({
        title: t('common.locationFetched'),
        description: t('common.locationFetched'),
      });
    } catch (error) {
      console.error("Location error:", error);
      toast({
        title: t('yieldPrediction.locationAccessFailed'),
        description: t('yieldPrediction.enterManually'),
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
    setPrediction(null);

    try {
      const { data, error } = await supabase.functions.invoke("predict-crop-yield", {
        body: formData,
      });

      if (error) throw error;

      setPrediction(data.predictedYield);
      toast({
        title: t('yieldPrediction.predictionComplete'),
        description: t('yieldPrediction.estimatedYieldMsg').replace('{yield}', data.predictedYield.toFixed(2)),
      });
    } catch (error) {
      console.error("Prediction error:", error);
      toast({
        title: t('yieldPrediction.predictionFailed'),
        description: t('yieldPrediction.unableToPredict'),
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
              <TrendingUp className="h-5 w-5 text-primary" />
              {t('yieldPrediction.title')}
            </CardTitle>
            <CardDescription>
              {t('yieldPrediction.description')}
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
                {t('yieldPrediction.refreshLocation')}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cropType">{t('yieldPrediction.cropType')}</Label>
              <Select
                value={formData.cropType}
                onValueChange={(value) => setFormData({ ...formData, cropType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('yieldPrediction.selectCrop')} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="rice">Rice</SelectItem>
                  <SelectItem value="wheat">Wheat</SelectItem>
                  <SelectItem value="maize">Maize</SelectItem>
                  <SelectItem value="chickpea">Chickpea</SelectItem>
                  <SelectItem value="kidneybeans">Kidney Beans</SelectItem>
                  <SelectItem value="pigeonpeas">Pigeon Peas</SelectItem>
                  <SelectItem value="mothbeans">Moth Beans</SelectItem>
                  <SelectItem value="mungbean">Mung Bean</SelectItem>
                  <SelectItem value="blackgram">Black Gram</SelectItem>
                  <SelectItem value="lentil">Lentil</SelectItem>
                  <SelectItem value="soybean">Soybean</SelectItem>
                  <SelectItem value="peanut">Peanut</SelectItem>
                  <SelectItem value="pomegranate">Pomegranate</SelectItem>
                  <SelectItem value="banana">Banana</SelectItem>
                  <SelectItem value="mango">Mango</SelectItem>
                  <SelectItem value="grapes">Grapes</SelectItem>
                  <SelectItem value="watermelon">Watermelon</SelectItem>
                  <SelectItem value="muskmelon">Muskmelon</SelectItem>
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="papaya">Papaya</SelectItem>
                  <SelectItem value="coconut">Coconut</SelectItem>
                  <SelectItem value="tomato">Tomato</SelectItem>
                  <SelectItem value="potato">Potato</SelectItem>
                  <SelectItem value="onion">Onion</SelectItem>
                  <SelectItem value="cotton">Cotton</SelectItem>
                  <SelectItem value="jute">Jute</SelectItem>
                  <SelectItem value="coffee">Coffee</SelectItem>
                  <SelectItem value="sugarcane">Sugarcane</SelectItem>
                  <SelectItem value="sunflower">Sunflower</SelectItem>
                  <SelectItem value="mustard">Mustard</SelectItem>
                  <SelectItem value="tea">Tea</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">{t('yieldPrediction.area')}</Label>
              <Input
                id="area"
                type="number"
                step="0.01"
                placeholder="e.g., 10.5"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rainfall">{t('yieldPrediction.rainfall')}</Label>
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
              <Label htmlFor="fertilizer">{t('yieldPrediction.fertilizer')}</Label>
              <Input
                id="fertilizer"
                type="number"
                step="0.1"
                placeholder="e.g., 150"
                value={formData.fertilizer}
                onChange={(e) => setFormData({ ...formData, fertilizer: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pesticide">{t('yieldPrediction.pesticide')}</Label>
              <Input
                id="pesticide"
                type="number"
                step="0.1"
                placeholder="e.g., 5"
                value={formData.pesticide}
                onChange={(e) => setFormData({ ...formData, pesticide: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">{t('yieldPrediction.temperature')}</Label>
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
              <Label htmlFor="humidity">{t('yieldPrediction.humidity')}</Label>
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
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('yieldPrediction.predicting')}
              </>
            ) : (
              t('yieldPrediction.predictYield')
            )}
          </Button>
        </form>

        {prediction !== null && (
          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <h3 className="font-semibold text-lg mb-2">{t('yieldPrediction.predictionResult')}</h3>
            <p className="text-2xl font-bold text-primary">
              {prediction.toFixed(2)} {t('yieldPrediction.tons')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('yieldPrediction.estimatedYield')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CropYieldPrediction;
