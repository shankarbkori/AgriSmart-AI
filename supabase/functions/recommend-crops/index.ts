import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Crop database with optimal conditions
const cropDatabase = [
  {
    crop: 'rice',
    optimalConditions: {
      nitrogen: { min: 80, max: 120 },
      phosphorus: { min: 40, max: 60 },
      potassium: { min: 40, max: 60 },
      temperature: { min: 20, max: 35 },
      humidity: { min: 60, max: 85 },
      ph: { min: 5.5, max: 7.0 },
      rainfall: { min: 1000, max: 2000 },
      seasons: ['monsoon', 'summer']
    }
  },
  {
    crop: 'wheat',
    optimalConditions: {
      nitrogen: { min: 60, max: 100 },
      phosphorus: { min: 30, max: 50 },
      potassium: { min: 30, max: 50 },
      temperature: { min: 15, max: 25 },
      humidity: { min: 40, max: 70 },
      ph: { min: 6.0, max: 7.5 },
      rainfall: { min: 450, max: 650 },
      seasons: ['winter', 'spring']
    }
  },
  {
    crop: 'corn',
    optimalConditions: {
      nitrogen: { min: 90, max: 150 },
      phosphorus: { min: 40, max: 70 },
      potassium: { min: 50, max: 80 },
      temperature: { min: 18, max: 32 },
      humidity: { min: 50, max: 75 },
      ph: { min: 5.8, max: 7.0 },
      rainfall: { min: 500, max: 800 },
      seasons: ['summer', 'spring']
    }
  },
  {
    crop: 'soybean',
    optimalConditions: {
      nitrogen: { min: 20, max: 40 },
      phosphorus: { min: 30, max: 50 },
      potassium: { min: 40, max: 60 },
      temperature: { min: 20, max: 30 },
      humidity: { min: 50, max: 80 },
      ph: { min: 6.0, max: 7.0 },
      rainfall: { min: 450, max: 700 },
      seasons: ['summer', 'monsoon']
    }
  },
  {
    crop: 'cotton',
    optimalConditions: {
      nitrogen: { min: 70, max: 110 },
      phosphorus: { min: 35, max: 55 },
      potassium: { min: 40, max: 65 },
      temperature: { min: 21, max: 35 },
      humidity: { min: 50, max: 75 },
      ph: { min: 6.0, max: 8.0 },
      rainfall: { min: 500, max: 750 },
      seasons: ['summer', 'spring']
    }
  },
];

const calculateConfidence = (params: any, cropConditions: any) => {
  const factors = [];
  
  // Check each parameter against optimal range
  for (const [key, value] of Object.entries(params)) {
    if (key === 'season') continue;
    
    const numValue = parseFloat(value as string);
    const optimal = cropConditions[key];
    
    if (optimal && optimal.min && optimal.max) {
      if (numValue >= optimal.min && numValue <= optimal.max) {
        factors.push(1.0);
      } else {
        const distance = Math.min(
          Math.abs(numValue - optimal.min),
          Math.abs(numValue - optimal.max)
        );
        const range = optimal.max - optimal.min;
        const score = Math.max(0, 1 - (distance / range));
        factors.push(score);
      }
    }
  }
  
  // Season match bonus
  if (cropConditions.seasons?.includes(params.season)) {
    factors.push(1.0);
  } else {
    factors.push(0.5);
  }
  
  return factors.reduce((a, b) => a + b, 0) / factors.length;
};

const getCropReason = (crop: string, confidence: number) => {
  const reasons: Record<string, string> = {
    rice: 'Ideal for areas with high rainfall and warm temperatures. Requires proper water management.',
    wheat: 'Best suited for cooler climates with moderate rainfall. Excellent winter crop.',
    corn: 'Thrives in warm weather with adequate nitrogen. High-yield potential.',
    soybean: 'Nitrogen-fixing legume, ideal for crop rotation. Moderate water requirements.',
    cotton: 'Requires warm climate and moderate rainfall. Good for well-drained soils.',
  };
  
  return `${reasons[crop]} Match score: ${(confidence * 100).toFixed(0)}%`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const params = await req.json();
    console.log('Generating crop recommendations for:', params);

    // Calculate confidence for each crop
    const recommendations = cropDatabase
      .map(({ crop, optimalConditions }) => ({
        crop,
        confidence: calculateConfidence(params, optimalConditions),
        reason: getCropReason(crop, calculateConfidence(params, optimalConditions))
      }))
      .filter(rec => rec.confidence > 0.4) // Filter out very poor matches
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Top 5 recommendations

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in recommend-crops:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
