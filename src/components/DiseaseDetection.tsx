import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle, Upload, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { pipeline } from "@huggingface/transformers";

interface DiseaseResult {
  disease: string;
  confidence: number;
  description: string;
  treatment: string;
  severity: string;
  pesticides?: string[];
  fertilizers?: string[];
  applicationTiming?: string;
  preventiveMeasures?: string;
  suggestions?: string[];
  analysisMethod?: string;
}

const DiseaseDetection = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [result, setResult] = useState<DiseaseResult | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: "No Image Selected",
        description: "Please select a plant image to analyze",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      toast({
        title: "Loading CNN Model",
        description: "Initializing plant disease detection model...",
      });

      console.log("Loading CNN image classification model...");
      
      // Load the CNN image classification model
      const classifier = await pipeline(
        'image-classification',
        'linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification',
        { device: 'webgpu' }
      );

      toast({
        title: "Analyzing Image",
        description: "Running CNN analysis on your plant image...",
      });

      console.log("Running CNN classification on image...");

      // Classify the image using the uploaded file
      const predictions = await classifier(previewUrl);

      if (!predictions || predictions.length === 0) {
        throw new Error('No predictions returned from CNN model');
      }

      console.log("CNN predictions:", predictions);

      // Extract top prediction with proper typing
      const result = Array.isArray(predictions) ? predictions : [predictions];
      const topPrediction = result[0] as { label: string; score: number };
      
      // Map the prediction label to our disease database format
      const diseaseMapping: Record<string, string> = {
        'powdery': 'Powdery Mildew',
        'mildew': 'Powdery Mildew',
        'blight': 'Leaf Blight',
        'leaf_spot': 'Leaf Blight',
        'spot': 'Leaf Blight',
        'rust': 'Rust',
        'bacterial': 'Bacterial Wilt',
        'wilt': 'Bacterial Wilt',
        'mosaic': 'Mosaic Virus',
        'virus': 'Mosaic Virus',
        'rot': 'Root Rot',
        'anthracnose': 'Anthracnose',
        'healthy': 'Healthy'
      };

      // Find matching disease name from CNN output
      let detectedDisease = 'Leaf Blight'; // default
      const labelLower = topPrediction.label.toLowerCase();
      
      for (const [key, value] of Object.entries(diseaseMapping)) {
        if (labelLower.includes(key)) {
          detectedDisease = value;
          break;
        }
      }

      console.log("Mapped disease:", detectedDisease, "from label:", topPrediction.label);

      // Call edge function to get detailed treatment info
      const { data, error } = await supabase.functions.invoke('detect-disease', {
        body: { 
          disease: detectedDisease,
          confidence: topPrediction.score,
          cnn_analysis: true,
          original_label: topPrediction.label
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }

      console.log("Disease detection result:", data);
      setResult(data);
      toast({
        title: "CNN Analysis Complete",
        description: `Detected: ${data.disease} with ${(data.confidence * 100).toFixed(1)}% confidence`,
      });
    } catch (error) {
      console.error("Disease detection error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze image. Ensure WebGPU is supported in your browser.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Crop Disease Detection
        </CardTitle>
        <CardDescription>
          Upload a plant image to detect diseases using MobileNetV2 CNN model trained on plant diseases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm font-medium">Click to upload plant image</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
              </div>
            </label>
          </div>

          {previewUrl && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border">
                <img
                  src={previewUrl}
                  alt="Selected plant"
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Image"
                )}
              </Button>
            </div>
          )}

          {result && (
            <div className="space-y-4 p-6 bg-card border rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{result.disease}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={getSeverityColor(result.severity)}>
                      {result.severity} Severity
                    </Badge>
                    <Badge variant="outline">
                      {(result.confidence * 100).toFixed(1)}% confidence
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      CNN Analysis
                    </Badge>
                  </div>
                </div>
                {result.disease.toLowerCase() === "healthy" ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-destructive" />
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{result.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Recommended Treatment</h4>
                  <p className="text-sm text-muted-foreground">{result.treatment}</p>
                </div>

                {result.pesticides && result.pesticides.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-1">Recommended Pesticides</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      {result.pesticides.map((pesticide, index) => (
                        <li key={index}>{pesticide}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.fertilizers && result.fertilizers.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-1">Recommended Fertilizers</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      {result.fertilizers.map((fertilizer, index) => (
                        <li key={index}>{fertilizer}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.applicationTiming && (
                  <div>
                    <h4 className="font-semibold mb-1">Application Timing</h4>
                    <p className="text-sm text-muted-foreground">{result.applicationTiming}</p>
                  </div>
                )}

                {result.preventiveMeasures && (
                  <div>
                    <h4 className="font-semibold mb-1">Preventive Measures</h4>
                    <p className="text-sm text-muted-foreground">{result.preventiveMeasures}</p>
                  </div>
                )}

                {result.suggestions && result.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-1">Suggestions for Better Results</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      {result.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiseaseDetection;
