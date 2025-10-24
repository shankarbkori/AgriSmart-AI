import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Disease database with descriptions and treatments
const diseaseDatabase = [
  {
    disease: 'Healthy',
    description: 'The plant appears to be healthy with no visible signs of disease or stress.',
    treatment: 'Continue regular maintenance and monitoring. Ensure proper watering and nutrition.',
    severity: 'Low'
  },
  {
    disease: 'Leaf Blight',
    description: 'Fungal disease causing brown or tan spots on leaves, often with a yellow halo.',
    treatment: 'Apply fungicide containing mancozeb or copper. Remove infected leaves. Improve air circulation.',
    severity: 'Medium'
  },
  {
    disease: 'Powdery Mildew',
    description: 'White powdery spots on leaves and stems caused by fungal infection.',
    treatment: 'Apply sulfur-based fungicide. Increase spacing between plants. Water at base of plants.',
    severity: 'Medium'
  },
  {
    disease: 'Bacterial Wilt',
    description: 'Bacterial infection causing rapid wilting and yellowing of leaves.',
    treatment: 'Remove and destroy infected plants. Avoid overhead watering. Use disease-resistant varieties.',
    severity: 'High'
  },
  {
    disease: 'Mosaic Virus',
    description: 'Viral disease causing mottled yellow and green patterns on leaves.',
    treatment: 'No cure available. Remove infected plants. Control aphids that spread the virus.',
    severity: 'High'
  },
  {
    disease: 'Root Rot',
    description: 'Fungal disease affecting roots, causing wilting and yellowing despite adequate water.',
    treatment: 'Improve drainage. Reduce watering frequency. Apply fungicide to soil. Remove affected plants.',
    severity: 'High'
  }
];

// Simplified CNN-like classification logic
const classifyDisease = (imageData: string) => {
  // In a real implementation, this would use a trained CNN model
  // For this demo, we'll simulate disease detection with random selection
  // weighted towards common diseases
  
  const random = Math.random();
  let selectedDisease;
  
  if (random < 0.3) {
    selectedDisease = diseaseDatabase[0]; // Healthy (30%)
  } else if (random < 0.5) {
    selectedDisease = diseaseDatabase[1]; // Leaf Blight (20%)
  } else if (random < 0.65) {
    selectedDisease = diseaseDatabase[2]; // Powdery Mildew (15%)
  } else if (random < 0.8) {
    selectedDisease = diseaseDatabase[3]; // Bacterial Wilt (15%)
  } else if (random < 0.9) {
    selectedDisease = diseaseDatabase[4]; // Mosaic Virus (10%)
  } else {
    selectedDisease = diseaseDatabase[5]; // Root Rot (10%)
  }
  
  // Generate confidence score (higher for healthy, varied for diseases)
  const confidence = selectedDisease.disease === 'Healthy' 
    ? 0.85 + Math.random() * 0.15
    : 0.70 + Math.random() * 0.25;
  
  return {
    ...selectedDisease,
    confidence
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    console.log('Detecting disease in uploaded image');

    if (!image) {
      throw new Error('No image provided');
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Classify the disease
    const result = classifyDisease(image);

    console.log('Disease detection result:', result.disease);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in detect-disease:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
