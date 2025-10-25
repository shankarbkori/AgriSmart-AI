import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle, Upload, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DiseaseResult {
  disease: string;
  confidence: number;
  description: string;
  treatment: string;
  severity: string;
  suggestions?: string[];
  analysisMethod?: string;
}

const DiseaseDetection = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
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
        title: t('disease.noImage'),
        description: t('disease.noImageDesc'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Convert file to base64 properly
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      console.log("Sending image to detect-disease function...");
      
      const { data, error } = await supabase.functions.invoke("detect-disease", {
        body: { image: base64Image },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }

      console.log("Disease detection result:", data);
      setResult(data);
      toast({
        title: t('disease.analysisComplete'),
        description: `${t('disease.diseaseDetected')}: ${data.disease}`,
      });
    } catch (error) {
      console.error("Disease detection error:", error);
      toast({
        title: t('disease.analysisFailed'),
        description: error instanceof Error ? error.message : t('disease.analysisFailed'),
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
          {t('disease.title')}
        </CardTitle>
        <CardDescription>
          {t('disease.description')}
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
                <p className="text-sm font-medium">{t('disease.uploadImage')}</p>
                <p className="text-xs text-muted-foreground">{t('disease.fileTypes')}</p>
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
                    {t('disease.analyzing')}
                  </>
                ) : (
                  t('disease.analyzeImage')
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
                      {result.severity} {t('disease.severity')}
                    </Badge>
                    <Badge variant="outline">
                      {(result.confidence * 100).toFixed(1)}% {t('disease.confidence')}
                    </Badge>
                    {result.analysisMethod && (
                      <Badge variant="secondary" className="text-xs">
                        AI Analysis
                      </Badge>
                    )}
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
                  <h4 className="font-semibold mb-1">{t('disease.description')}</h4>
                  <p className="text-sm text-muted-foreground">{result.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">{t('disease.treatment')}</h4>
                  <p className="text-sm text-muted-foreground">{result.treatment}</p>
                </div>

                {result.suggestions && result.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-1">{t('disease.suggestions')}</h4>
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
