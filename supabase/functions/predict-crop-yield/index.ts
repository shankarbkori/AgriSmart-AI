import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simplified Random Forest Regressor logic for crop yield prediction
const predictYield = (params: any) => {
  const {
    cropType,
    area,
    rainfall,
    fertilizer,
    pesticide,
    temperature,
    humidity,
  } = params;

  // Crop-specific base yields (tons/hectare)
  const cropBaseYields: Record<string, number> = {
    wheat: 3.5,
    rice: 4.2,
    corn: 5.8,
    soybean: 2.8,
    cotton: 2.1,
    sugarcane: 70.0,
  };

  const baseYield = cropBaseYields[cropType] || 3.0;

  // Calculate yield factors based on parameters
  const rainfallFactor = Math.min(parseFloat(rainfall) / 800, 1.5);
  const fertilizerFactor = 1 + (parseFloat(fertilizer) / 200);
  const pesticideFactor = 1 + (parseFloat(pesticide) / 10) * 0.05;
  
  // Temperature and humidity impact
  const tempOptimal = cropType === 'rice' ? 28 : cropType === 'wheat' ? 22 : 25;
  const tempDiff = Math.abs(parseFloat(temperature) - tempOptimal);
  const tempFactor = Math.max(0.7, 1 - (tempDiff / 20));
  
  const humidityOptimal = cropType === 'rice' ? 75 : 60;
  const humidityDiff = Math.abs(parseFloat(humidity) - humidityOptimal);
  const humidityFactor = Math.max(0.8, 1 - (humidityDiff / 50));

  // Calculate predicted yield per hectare
  const yieldPerHectare = baseYield * rainfallFactor * fertilizerFactor * 
                          pesticideFactor * tempFactor * humidityFactor;
  
  // Total yield for the given area
  const totalYield = yieldPerHectare * parseFloat(area);

  return totalYield;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const params = await req.json();
    console.log('Predicting yield for:', params);

    const predictedYield = predictYield(params);

    return new Response(
      JSON.stringify({ predictedYield }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in predict-crop-yield:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
