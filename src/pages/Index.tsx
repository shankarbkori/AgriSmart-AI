import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sprout, Cloud, AlertCircle, BarChart3, LogOut, Loader2 } from "lucide-react";
import CropYieldPrediction from "@/components/CropYieldPrediction";
import CropRecommendation from "@/components/CropRecommendation";
import WeatherDashboard from "@/components/WeatherDashboard";
import DiseaseDetection from "@/components/DiseaseDetection";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sprout className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">AgriSmart AI</h1>
                <p className="text-sm text-muted-foreground">Advanced Agricultural Intelligence System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="yield" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="yield" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Yield Prediction</span>
              <span className="sm:hidden">Yield</span>
            </TabsTrigger>
            <TabsTrigger value="recommendation" className="flex items-center gap-2">
              <Sprout className="h-4 w-4" />
              <span className="hidden sm:inline">Crop Recommendation</span>
              <span className="sm:hidden">Crops</span>
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              <span className="hidden sm:inline">Weather Dashboard</span>
              <span className="sm:hidden">Weather</span>
            </TabsTrigger>
            <TabsTrigger value="disease" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Disease Detection</span>
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
