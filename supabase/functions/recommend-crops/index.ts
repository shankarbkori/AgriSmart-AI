import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Crop database with optimal conditions based on Kaggle dataset
const cropDatabase = [
  {
    crop: 'rice',
    optimalConditions: {
      nitrogen: { min: 60, max: 100 },
      phosphorus: { min: 35, max: 55 },
      potassium: { min: 35, max: 45 },
      temperature: { min: 20, max: 30 },
      humidity: { min: 80, max: 90 },
      ph: { min: 5.5, max: 7.0 },
      rainfall: { min: 150, max: 300 },
      seasons: ['monsoon', 'summer']
    }
  },
  {
    crop: 'maize',
    optimalConditions: {
      nitrogen: { min: 60, max: 90 },
      phosphorus: { min: 35, max: 55 },
      potassium: { min: 15, max: 25 },
      temperature: { min: 18, max: 27 },
      humidity: { min: 55, max: 75 },
      ph: { min: 5.5, max: 7.0 },
      rainfall: { min: 60, max: 110 },
      seasons: ['summer', 'spring']
    }
  },
  {
    crop: 'chickpea',
    optimalConditions: {
      nitrogen: { min: 20, max: 50 },
      phosphorus: { min: 55, max: 75 },
      potassium: { min: 75, max: 85 },
      temperature: { min: 17, max: 27 },
      humidity: { min: 15, max: 25 },
      ph: { min: 6.0, max: 7.5 },
      rainfall: { min: 60, max: 100 },
      seasons: ['winter', 'spring']
    }
  },
  {
    crop: 'kidneybeans',
    optimalConditions: {
      nitrogen: { min: 15, max: 30 },
      phosphorus: { min: 55, max: 75 },
      potassium: { min: 18, max: 28 },
      temperature: { min: 15, max: 25 },
      humidity: { min: 18, max: 28 },
      ph: { min: 5.5, max: 6.5 },
      rainfall: { min: 60, max: 90 },
      seasons: ['spring', 'summer']
    }
  },
  {
    crop: 'pigeonpeas',
    optimalConditions: {
      nitrogen: { min: 15, max: 30 },
      phosphorus: { min: 55, max: 75 },
      potassium: { min: 18, max: 28 },
      temperature: { min: 18, max: 30 },
      humidity: { min: 50, max: 75 },
      ph: { min: 5.5, max: 7.5 },
      rainfall: { min: 100, max: 200 },
      seasons: ['monsoon', 'summer']
    }
  },
  {
    crop: 'mothbeans',
    optimalConditions: {
      nitrogen: { min: 15, max: 30 },
      phosphorus: { min: 45, max: 65 },
      potassium: { min: 18, max: 28 },
      temperature: { min: 24, max: 32 },
      humidity: { min: 55, max: 75 },
      ph: { min: 6.0, max: 7.5 },
      rainfall: { min: 20, max: 60 },
      seasons: ['summer', 'monsoon']
    }
  },
  {
    crop: 'mungbean',
    optimalConditions: {
      nitrogen: { min: 15, max: 30 },
      phosphorus: { min: 35, max: 55 },
      potassium: { min: 35, max: 50 },
      temperature: { min: 25, max: 35 },
      humidity: { min: 75, max: 90 },
      ph: { min: 6.0, max: 7.5 },
      rainfall: { min: 60, max: 100 },
      seasons: ['summer', 'monsoon']
    }
  },
  {
    crop: 'blackgram',
    optimalConditions: {
      nitrogen: { min: 30, max: 50 },
      phosphorus: { min: 55, max: 75 },
      potassium: { min: 35, max: 50 },
      temperature: { min: 25, max: 35 },
      humidity: { min: 65, max: 80 },
      ph: { min: 6.0, max: 7.5 },
      rainfall: { min: 60, max: 100 },
      seasons: ['summer', 'monsoon']
    }
  },
  {
    crop: 'lentil',
    optimalConditions: {
      nitrogen: { min: 15, max: 30 },
      phosphorus: { min: 55, max: 75 },
      potassium: { min: 18, max: 28 },
      temperature: { min: 15, max: 27 },
      humidity: { min: 55, max: 75 },
      ph: { min: 6.0, max: 7.5 },
      rainfall: { min: 60, max: 100 },
      seasons: ['winter', 'spring']
    }
  },
  {
    crop: 'pomegranate',
    optimalConditions: {
      nitrogen: { min: 15, max: 30 },
      phosphorus: { min: 10, max: 25 },
      potassium: { min: 35, max: 50 },
      temperature: { min: 18, max: 30 },
      humidity: { min: 85, max: 95 },
      ph: { min: 5.5, max: 7.5 },
      rainfall: { min: 100, max: 180 },
      seasons: ['spring', 'summer']
    }
  },
  {
    crop: 'banana',
    optimalConditions: {
      nitrogen: { min: 80, max: 120 },
      phosphorus: { min: 65, max: 90 },
      potassium: { min: 45, max: 55 },
      temperature: { min: 25, max: 35 },
      humidity: { min: 75, max: 90 },
      ph: { min: 5.5, max: 7.0 },
      rainfall: { min: 100, max: 250 },
      seasons: ['monsoon', 'summer']
    }
  },
  {
    crop: 'mango',
    optimalConditions: {
      nitrogen: { min: 15, max: 30 },
      phosphorus: { min: 35, max: 55 },
      potassium: { min: 45, max: 55 },
      temperature: { min: 24, max: 35 },
      humidity: { min: 45, max: 60 },
      ph: { min: 5.5, max: 7.5 },
      rainfall: { min: 80, max: 180 },
      seasons: ['summer', 'spring']
    }
  },
  {
    crop: 'grapes',
    optimalConditions: {
      nitrogen: { min: 15, max: 30 },
      phosphorus: { min: 115, max: 145 },
      potassium: { min: 185, max: 215 },
      temperature: { min: 8, max: 25 },
      humidity: { min: 80, max: 95 },
      ph: { min: 5.5, max: 7.0 },
      rainfall: { min: 80, max: 120 },
      seasons: ['winter', 'spring']
    }
  },
  {
    crop: 'watermelon',
    optimalConditions: {
      nitrogen: { min: 80, max: 120 },
      phosphorus: { min: 10, max: 30 },
      potassium: { min: 45, max: 55 },
      temperature: { min: 24, max: 32 },
      humidity: { min: 80, max: 95 },
      ph: { min: 6.0, max: 7.5 },
      rainfall: { min: 40, max: 60 },
      seasons: ['summer', 'spring']
    }
  },
  {
    crop: 'muskmelon',
    optimalConditions: {
      nitrogen: { min: 80, max: 120 },
      phosphorus: { min: 10, max: 30 },
      potassium: { min: 45, max: 55 },
      temperature: { min: 18, max: 30 },
      humidity: { min: 85, max: 95 },
      ph: { min: 6.0, max: 7.5 },
      rainfall: { min: 20, max: 50 },
      seasons: ['summer', 'spring']
    }
  },
  {
    crop: 'apple',
    optimalConditions: {
      nitrogen: { min: 15, max: 30 },
      phosphorus: { min: 115, max: 145 },
      potassium: { min: 195, max: 215 },
      temperature: { min: 8, max: 25 },
      humidity: { min: 80, max: 95 },
      ph: { min: 5.5, max: 7.0 },
      rainfall: { min: 80, max: 180 },
      seasons: ['winter', 'spring']
    }
  },
  {
    crop: 'orange',
    optimalConditions: {
      nitrogen: { min: 10, max: 25 },
      phosphorus: { min: 10, max: 30 },
      potassium: { min: 10, max: 25 },
      temperature: { min: 10, max: 35 },
      humidity: { min: 80, max: 95 },
      ph: { min: 5.5, max: 7.5 },
      rainfall: { min: 100, max: 180 },
      seasons: ['spring', 'summer']
    }
  },
  {
    crop: 'papaya',
    optimalConditions: {
      nitrogen: { min: 40, max: 60 },
      phosphorus: { min: 55, max: 75 },
      potassium: { min: 45, max: 55 },
      temperature: { min: 25, max: 38 },
      humidity: { min: 80, max: 95 },
      ph: { min: 6.0, max: 7.5 },
      rainfall: { min: 100, max: 200 },
      seasons: ['summer', 'monsoon']
    }
  },
  {
    crop: 'coconut',
    optimalConditions: {
      nitrogen: { min: 15, max: 30 },
      phosphorus: { min: 10, max: 30 },
      potassium: { min: 30, max: 45 },
      temperature: { min: 25, max: 35 },
      humidity: { min: 70, max: 90 },
      ph: { min: 5.5, max: 7.5 },
      rainfall: { min: 100, max: 250 },
      seasons: ['monsoon', 'summer']
    }
  },
  {
    crop: 'cotton',
    optimalConditions: {
      nitrogen: { min: 105, max: 135 },
      phosphorus: { min: 35, max: 55 },
      potassium: { min: 18, max: 28 },
      temperature: { min: 20, max: 30 },
      humidity: { min: 75, max: 90 },
      ph: { min: 6.0, max: 8.0 },
      rainfall: { min: 60, max: 120 },
      seasons: ['summer', 'spring']
    }
  },
  {
    crop: 'jute',
    optimalConditions: {
      nitrogen: { min: 70, max: 100 },
      phosphorus: { min: 35, max: 55 },
      potassium: { min: 35, max: 50 },
      temperature: { min: 24, max: 37 },
      humidity: { min: 75, max: 95 },
      ph: { min: 6.0, max: 7.5 },
      rainfall: { min: 150, max: 250 },
      seasons: ['monsoon', 'summer']
    }
  },
  {
    crop: 'coffee',
    optimalConditions: {
      nitrogen: { min: 80, max: 120 },
      phosphorus: { min: 10, max: 30 },
      potassium: { min: 25, max: 35 },
      temperature: { min: 18, max: 30 },
      humidity: { min: 50, max: 85 },
      ph: { min: 5.5, max: 7.0 },
      rainfall: { min: 150, max: 280 },
      seasons: ['monsoon', 'summer']
    }
  },
  {
    crop: 'wheat',
    optimalConditions: {
      nitrogen: { min: 50, max: 80 },
      phosphorus: { min: 35, max: 55 },
      potassium: { min: 25, max: 40 },
      temperature: { min: 12, max: 25 },
      humidity: { min: 50, max: 70 },
      ph: { min: 6.0, max: 7.5 },
      rainfall: { min: 50, max: 100 },
      seasons: ['winter', 'spring']
    }
  },
  {
    crop: 'tomato',
    optimalConditions: {
      nitrogen: { min: 60, max: 100 },
      phosphorus: { min: 40, max: 60 },
      potassium: { min: 50, max: 70 },
      temperature: { min: 20, max: 30 },
      humidity: { min: 60, max: 80 },
      ph: { min: 6.0, max: 7.0 },
      rainfall: { min: 50, max: 100 },
      seasons: ['spring', 'summer', 'winter']
    }
  },
  {
    crop: 'potato',
    optimalConditions: {
      nitrogen: { min: 50, max: 90 },
      phosphorus: { min: 50, max: 80 },
      potassium: { min: 50, max: 80 },
      temperature: { min: 15, max: 25 },
      humidity: { min: 70, max: 90 },
      ph: { min: 5.5, max: 7.0 },
      rainfall: { min: 60, max: 120 },
      seasons: ['winter', 'spring']
    }
  },
  {
    crop: 'onion',
    optimalConditions: {
      nitrogen: { min: 40, max: 70 },
      phosphorus: { min: 30, max: 50 },
      potassium: { min: 40, max: 60 },
      temperature: { min: 13, max: 28 },
      humidity: { min: 60, max: 75 },
      ph: { min: 6.0, max: 7.5 },
      rainfall: { min: 40, max: 80 },
      seasons: ['winter', 'spring']
    }
  },
  {
    crop: 'sugarcane',
    optimalConditions: {
      nitrogen: { min: 100, max: 150 },
      phosphorus: { min: 40, max: 60 },
      potassium: { min: 60, max: 90 },
      temperature: { min: 25, max: 38 },
      humidity: { min: 75, max: 90 },
      ph: { min: 6.0, max: 8.0 },
      rainfall: { min: 150, max: 250 },
      seasons: ['monsoon', 'summer']
    }
  },
  {
    crop: 'soybean',
    optimalConditions: {
      nitrogen: { min: 20, max: 40 },
      phosphorus: { min: 40, max: 60 },
      potassium: { min: 30, max: 50 },
      temperature: { min: 20, max: 30 },
      humidity: { min: 60, max: 80 },
      ph: { min: 6.0, max: 7.5 },
      rainfall: { min: 60, max: 120 },
      seasons: ['monsoon', 'summer']
    }
  },
  {
    crop: 'peanut',
    optimalConditions: {
      nitrogen: { min: 20, max: 40 },
      phosphorus: { min: 30, max: 50 },
      potassium: { min: 30, max: 50 },
      temperature: { min: 25, max: 35 },
      humidity: { min: 55, max: 75 },
      ph: { min: 6.0, max: 7.5 },
      rainfall: { min: 50, max: 100 },
      seasons: ['summer', 'monsoon']
    }
  },
  {
    crop: 'sunflower',
    optimalConditions: {
      nitrogen: { min: 50, max: 80 },
      phosphorus: { min: 30, max: 50 },
      potassium: { min: 40, max: 60 },
      temperature: { min: 20, max: 32 },
      humidity: { min: 50, max: 70 },
      ph: { min: 6.0, max: 7.5 },
      rainfall: { min: 40, max: 80 },
      seasons: ['summer', 'spring']
    }
  },
  {
    crop: 'mustard',
    optimalConditions: {
      nitrogen: { min: 40, max: 70 },
      phosphorus: { min: 30, max: 50 },
      potassium: { min: 20, max: 40 },
      temperature: { min: 10, max: 25 },
      humidity: { min: 60, max: 75 },
      ph: { min: 6.0, max: 7.5 },
      rainfall: { min: 40, max: 80 },
      seasons: ['winter', 'spring']
    }
  },
  {
    crop: 'tea',
    optimalConditions: {
      nitrogen: { min: 80, max: 120 },
      phosphorus: { min: 20, max: 40 },
      potassium: { min: 40, max: 60 },
      temperature: { min: 18, max: 30 },
      humidity: { min: 70, max: 90 },
      ph: { min: 4.5, max: 6.0 },
      rainfall: { min: 150, max: 300 },
      seasons: ['monsoon', 'summer']
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
    maize: 'Thrives in warm weather with adequate nitrogen. Versatile cereal crop.',
    chickpea: 'Nitrogen-fixing legume, excellent for cool season. Low water requirement.',
    kidneybeans: 'Best in cool climates with moderate moisture. Rich in protein.',
    pigeonpeas: 'Drought-tolerant legume, ideal for warm regions. Good for intercropping.',
    mothbeans: 'Hardy drought-resistant crop. Suitable for arid and semi-arid regions.',
    mungbean: 'Quick-maturing crop, suits warm humid conditions. Excellent summer legume.',
    blackgram: 'Protein-rich pulse, ideal for warm humid areas. Good for crop rotation.',
    lentil: 'Cool season crop with low water needs. Excellent winter legume.',
    pomegranate: 'Drought-tolerant fruit, needs warm climate. High market value.',
    banana: 'High nutrient demand, needs warm humid climate. Year-round production.',
    mango: 'Tropical fruit, requires warm dry season for flowering. Premium export crop.',
    grapes: 'Temperate climate fruit, needs cool winters. High-value commercial crop.',
    watermelon: 'Summer crop, needs warm weather and moderate water. Quick returns.',
    muskmelon: 'Warm season crop, drought-tolerant. Good for sandy soils.',
    apple: 'Temperate fruit, requires cold winters. Long-term investment.',
    orange: 'Citrus crop, needs warm climate with good rainfall. High vitamin C.',
    papaya: 'Fast-growing tropical fruit. Year-round bearing with high returns.',
    coconut: 'Coastal crop, needs humid climate. Long-duration with steady income.',
    cotton: 'Commercial fiber crop, warm climate preferred. Good market demand.',
    jute: 'Fiber crop, requires warm humid conditions. Important for textile industry.',
    coffee: 'Shade-loving crop, needs cool humid climate. Premium export commodity.',
    wheat: 'Major cereal crop, needs cool climate. High protein staple grain.',
    tomato: 'High-value vegetable, needs moderate climate. Year-round market demand.',
    potato: 'Cool season tuber crop. Essential food crop with good storage.',
    onion: 'Versatile vegetable, needs cool dry season. Excellent commercial crop.',
    sugarcane: 'Tropical cash crop, needs warm humid climate. High water requirement.',
    soybean: 'Nitrogen-fixing oilseed, versatile climate adaptation. High protein content.',
    peanut: 'Oilseed legume, warm climate crop. Drought-resistant and profitable.',
    sunflower: 'Oilseed crop, drought-tolerant. Short duration with good returns.',
    mustard: 'Cool season oilseed, low water requirement. Good for winter season.',
    tea: 'Perennial plantation crop, needs acidic soil. Premium beverage crop.',
  };
  
  return `${reasons[crop] || 'Suitable for your conditions.'} Match score: ${(confidence * 100).toFixed(0)}%`;
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
