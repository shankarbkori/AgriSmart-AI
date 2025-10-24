import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp } from "lucide-react";

const CropYieldPrediction = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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
        title: "Prediction Complete",
        description: `Estimated yield: ${data.predictedYield.toFixed(2)} tons`,
      });
    } catch (error) {
      console.error("Prediction error:", error);
      toast({
        title: "Prediction Failed",
        description: "Unable to predict crop yield. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Crop Yield Prediction
        </CardTitle>
        <CardDescription>
          Predict crop production using machine learning based on environmental and farming parameters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cropType">Crop Type</Label>
              <Select
                value={formData.cropType}
                onValueChange={(value) => setFormData({ ...formData, cropType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select crop type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wheat">Wheat</SelectItem>
                  <SelectItem value="rice">Rice</SelectItem>
                  <SelectItem value="corn">Corn</SelectItem>
                  <SelectItem value="soybean">Soybean</SelectItem>
                  <SelectItem value="cotton">Cotton</SelectItem>
                  <SelectItem value="sugarcane">Sugarcane</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Area (hectares)</Label>
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
              <Label htmlFor="fertilizer">Fertilizer (kg/hectare)</Label>
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
              <Label htmlFor="pesticide">Pesticide (kg/hectare)</Label>
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
              <Label htmlFor="temperature">Avg Temperature (°C)</Label>
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
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Predicting...
              </>
            ) : (
              "Predict Yield"
            )}
          </Button>
        </form>

        {prediction !== null && (
          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <h3 className="font-semibold text-lg mb-2">Prediction Result</h3>
            <p className="text-2xl font-bold text-primary">
              {prediction.toFixed(2)} tons
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Estimated crop yield based on provided parameters
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CropYieldPrediction;
