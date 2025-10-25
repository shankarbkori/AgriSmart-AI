import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sprout, Cloud, AlertCircle, BarChart3 } from "lucide-react";
import CropYieldPrediction from "@/components/CropYieldPrediction";
import CropRecommendation from "@/components/CropRecommendation";
import WeatherDashboard from "@/components/WeatherDashboard";
import DiseaseDetection from "@/components/DiseaseDetection";
import { LanguageSelector } from "@/components/LanguageSelector";

const Index = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sprout className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t('app.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('app.subtitle')}</p>
              </div>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="yield" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="yield" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">{t('tabs.yieldPrediction')}</span>
              <span className="sm:hidden">Yield</span>
            </TabsTrigger>
            <TabsTrigger value="recommendation" className="flex items-center gap-2">
              <Sprout className="h-4 w-4" />
              <span className="hidden sm:inline">{t('tabs.cropRecommendation')}</span>
              <span className="sm:hidden">Crops</span>
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              <span className="hidden sm:inline">{t('tabs.weather')}</span>
              <span className="sm:hidden">Weather</span>
            </TabsTrigger>
            <TabsTrigger value="disease" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="hidden sm:inline">{t('tabs.diseaseDetection')}</span>
              <span className="sm:hidden">Disease</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="yield">
            <CropYieldPrediction />
          </TabsContent>

          <TabsContent value="recommendation">
            <CropRecommendation />
          </TabsContent>

          <TabsContent value="weather">
            <WeatherDashboard />
          </TabsContent>

          <TabsContent value="disease">
            <DiseaseDetection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
