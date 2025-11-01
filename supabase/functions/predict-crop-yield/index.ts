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

  // Crop-specific base yields (tons/hectare) - from Kaggle dataset
  const cropBaseYields: Record<string, number> = {
    rice: 4.5,
    wheat: 3.5,
    maize: 5.8,
    chickpea: 2.0,
    kidneybeans: 1.8,
    pigeonpeas: 1.5,
    mothbeans: 1.2,
    mungbean: 1.3,
    blackgram: 1.4,
    lentil: 1.6,
    pomegranate: 12.0,
    banana: 40.0,
    mango: 15.0,
    grapes: 20.0,
    watermelon: 30.0,
    muskmelon: 25.0,
    apple: 18.0,
    orange: 22.0,
    papaya: 35.0,
    coconut: 8.0,
    cotton: 2.1,
    jute: 2.5,
    coffee: 1.2,
    tomato: 55.0,
    potato: 25.0,
    onion: 20.0,
    sugarcane: 70.0,
    soybean: 2.8,
    peanut: 2.2,
    sunflower: 2.5,
    mustard: 1.5,
    tea: 1.8,
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
