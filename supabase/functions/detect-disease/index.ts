import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Disease database with descriptions, treatments, and detailed recommendations
const diseaseDatabase = {
  'Healthy': {
    description: 'The plant appears to be healthy with no visible signs of disease or stress.',
    treatment: 'Continue regular maintenance and monitoring. Ensure proper watering and nutrition.',
    severity: 'Low',
    pesticides: ['No pesticides needed - maintain preventive spray schedule if in disease-prone area'],
    fertilizers: ['Balanced NPK 19:19:19 (5 g/L) every 10-14 days', 'Micronutrient foliar spray (2 g/L) monthly'],
    applicationTiming: 'Regular balanced nutrition every 10-14 days, micronutrients monthly',
    preventiveMeasures: 'Continue good cultural practices: proper spacing, adequate watering, balanced nutrition, regular monitoring'
  },
  'Leaf Blight': {
    description: 'Fungal disease causing brown or tan spots on leaves, often with a yellow halo.',
    treatment: 'Apply fungicide containing mancozeb or copper. Remove infected leaves. Improve air circulation.',
    severity: 'Medium',
    pesticides: ['Mancozeb (2-3 g/L)', 'Copper Oxychloride (3 g/L)', 'Chlorothalonil (2 ml/L)'],
    fertilizers: ['Balanced NPK 19:19:19 (5 g/L)', 'Potassium Sulphate (2 g/L)', 'Zinc Sulphate (1 g/L)'],
    applicationTiming: 'Spray every 7-10 days, avoid during rain. Early morning application preferred',
    preventiveMeasures: 'Remove infected leaves promptly, maintain plant spacing of 60-90 cm, ensure good air circulation, avoid overhead watering'
  },
  'Powdery Mildew': {
    description: 'White powdery spots on leaves and stems caused by fungal infection.',
    treatment: 'Apply sulfur-based fungicide. Increase spacing between plants. Water at base of plants.',
    severity: 'Medium',
    pesticides: ['Sulfur 80% WP (3 g/L)', 'Hexaconazole (1 ml/L)', 'Triadimefon (0.5 ml/L)', 'Potassium Bicarbonate (5 g/L)'],
    fertilizers: ['Potassium Nitrate (3 g/L)', 'NPK 12:61:0 (4 g/L)', 'Calcium Chloride (2 g/L)'],
    applicationTiming: 'Spray at first sign of disease, repeat every 7 days, avoid spraying in hot sun',
    preventiveMeasures: 'Ensure good air circulation, avoid overcrowding, reduce humidity below 70%, remove affected parts immediately'
  },
  'Bacterial Wilt': {
    description: 'Bacterial infection causing rapid wilting and yellowing of leaves.',
    treatment: 'Remove and destroy infected plants. Avoid overhead watering. Use disease-resistant varieties.',
    severity: 'High',
    pesticides: ['Streptomycin Sulphate (0.5 g/L)', 'Copper Hydroxide (2.5 g/L)', 'Bordeaux Mixture (1%)'],
    fertilizers: ['Calcium Nitrate (3 g/L)', 'NPK 13:0:45 (4 g/L)', 'Boron (0.5 g/L)'],
    applicationTiming: 'Apply at first symptom, repeat every 5 days. Drench soil around plant base',
    preventiveMeasures: 'Remove and destroy infected plants immediately, sanitize tools between plants, use drip irrigation, plant resistant varieties'
  },
  'Mosaic Virus': {
    description: 'Viral disease causing mottled yellow and green patterns on leaves.',
    treatment: 'No cure available. Remove infected plants. Control aphid vectors aggressively.',
    severity: 'High',
    pesticides: ['Imidacloprid (0.5 ml/L) - for aphid control', 'Acetamiprid (0.5 g/L) - for aphid control', 'Neem Oil (5 ml/L)'],
    fertilizers: ['NPK 10:26:26 (5 g/L)', 'Micronutrient Mix (3 g/L)', 'Zinc Sulphate (1.5 g/L)', 'Humic Acid (2 ml/L)'],
    applicationTiming: 'Focus on vector control - spray insecticides every 7 days, no cure for virus once infected',
    preventiveMeasures: 'Remove and destroy infected plants immediately, control aphid population aggressively, use virus-free seeds, plant resistant varieties, use reflective mulch'
  },
  'Root Rot': {
    description: 'Fungal disease affecting roots, causing wilting and yellowing despite adequate water.',
    treatment: 'Improve drainage. Reduce watering frequency. Apply fungicide to soil. Remove affected plants.',
    severity: 'High',
    pesticides: ['Metalaxyl (2 g/L) - soil drench', 'Trichoderma viride (5 g/L)', 'Copper Fungicide (2 g/L)'],
    fertilizers: ['NPK 20:20:20 (5 g/L)', 'Calcium Sulphate (3 g/L)', 'Beneficial microbes'],
    applicationTiming: 'Drench soil thoroughly, repeat every 10 days. Reduce watering frequency',
    preventiveMeasures: 'Ensure proper drainage, avoid overwatering, use raised beds, incorporate organic matter, remove affected plants to prevent spread'
  },
  'Rust': {
    description: 'Orange or reddish-brown pustules on leaves caused by fungal infection.',
    treatment: 'Apply fungicide with copper or sulfur. Remove infected leaves. Ensure good air circulation.',
    severity: 'Medium',
    pesticides: ['Mancozeb (2.5 g/L)', 'Propiconazole (1 ml/L)', 'Copper Fungicide (3 g/L)', 'Sulfur (3 g/L)'],
    fertilizers: ['NPK 19:19:19 (5 g/L)', 'Potassium Sulphate (2 g/L)', 'Magnesium Sulphate (2 g/L)'],
    applicationTiming: 'Apply at first sign, repeat every 7-10 days. Spray both leaf surfaces thoroughly',
    preventiveMeasures: 'Remove infected leaves immediately, increase plant spacing, avoid overhead irrigation, maintain balanced nutrition'
  },
  'Anthracnose': {
    description: 'Dark, sunken lesions on leaves, stems, or fruits caused by fungal infection.',
    treatment: 'Remove infected plant parts. Apply copper-based fungicide. Avoid overhead irrigation.',
    severity: 'High',
    pesticides: ['Copper Oxychloride (3 g/L)', 'Mancozeb (2.5 g/L)', 'Azoxystrobin (1 ml/L)', 'Chlorothalonil (2 ml/L)'],
    fertilizers: ['NPK 15:15:15 (5 g/L)', 'Calcium Nitrate (2 g/L)', 'Potassium Nitrate (3 g/L)'],
    applicationTiming: 'Spray every 7 days during disease pressure. Early morning or late evening application',
    preventiveMeasures: 'Remove and destroy infected plant debris, avoid overhead watering, maintain proper plant nutrition, improve air circulation, mulch to prevent soil splash'
  }
};

// Analyze disease using AI vision model
const analyzeDiseaseWithAI = async (imageBase64: string) => {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY is not configured');
  }

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are an expert plant pathologist. Analyze this image with these strict validation rules:

STEP 1: VALIDATE if this is a plant leaf or plant part
- If the image is NOT a plant leaf (e.g., random objects, people, animals, text, etc.), respond with: {"isPlant": false, "disease": "Invalid Image", "confidence": 0.0, "severity": "Low"}
- If the image is too blurry, dark, or unclear to analyze properly, respond with: {"isPlant": false, "disease": "Invalid Image", "confidence": 0.0, "severity": "Low"}

STEP 2: If it IS a valid plant leaf image, analyze for diseases
- Identify the disease with high confidence (>0.6)
- If you're unsure (confidence <0.6), respond with: {"isPlant": true, "disease": "Unknown", "confidence": [your confidence], "severity": "Low"}

Respond with ONLY a JSON object in this exact format:
{
  "isPlant": true or false,
  "disease": "name of disease or 'Healthy' or 'Invalid Image' or 'Unknown'",
  "confidence": 0.0-1.0,
  "severity": "Low", "Medium", or "High"
}

Common diseases: Leaf Blight, Powdery Mildew, Bacterial Wilt, Mosaic Virus, Root Rot, Rust, Anthracnose, or Healthy.

Be strict: Only classify as "Healthy" if you're confident (>0.7) it's a plant leaf with NO disease signs.`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error: ${response.status} - ${errorText}`);
  }

  const aiResult = await response.json();
  const content = aiResult.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No response from AI');
  }

  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid AI response format');
  }

  const analysis = JSON.parse(jsonMatch[0]);
  
  // Validate if image is a plant
  if (analysis.isPlant === false || analysis.disease === 'Invalid Image') {
    return {
      disease: 'Invalid Image',
      confidence: 0.0,
      severity: 'Low',
      description: 'The uploaded image does not appear to be a plant leaf or is of insufficient quality for analysis.',
      treatment: 'Please upload a clear, well-lit image of a plant leaf showing any symptoms or affected areas.',
      pesticides: [],
      fertilizers: [],
      applicationTiming: 'N/A',
      preventiveMeasures: 'Ensure the image contains a visible plant leaf with good lighting and focus.'
    };
  }
  
  // Check confidence threshold
  const MIN_CONFIDENCE = 0.6;
  if (analysis.confidence < MIN_CONFIDENCE || analysis.disease === 'Unknown') {
    return {
      disease: 'Unknown',
      confidence: analysis.confidence,
      severity: 'Low',
      description: 'The disease could not be identified with sufficient confidence. The image quality may be poor or the disease may not be in our database.',
      treatment: 'Please try uploading a clearer, closer image of the affected area. If symptoms persist, consult a local agricultural expert.',
      pesticides: [],
      fertilizers: [],
      applicationTiming: 'N/A',
      preventiveMeasures: 'Take photos in good lighting showing clear symptoms on leaves.'
    };
  }
  
  // Get disease details from database
  const diseaseInfo = diseaseDatabase[analysis.disease as keyof typeof diseaseDatabase] || diseaseDatabase['Healthy'];
  
  return {
    disease: analysis.disease,
    confidence: analysis.confidence,
    severity: analysis.severity || diseaseInfo.severity,
    description: diseaseInfo.description,
    treatment: diseaseInfo.treatment,
    pesticides: diseaseInfo.pesticides,
    fertilizers: diseaseInfo.fertilizers,
    applicationTiming: diseaseInfo.applicationTiming,
    preventiveMeasures: diseaseInfo.preventiveMeasures
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    console.log('Detecting disease in uploaded image using AI vision');

    if (!image) {
      throw new Error('No image provided. Please upload a clear image of the affected plant leaves or stems.');
    }

    // Validate image format
    if (!image.startsWith('data:image/')) {
      throw new Error('Invalid image format. Please upload a JPG or PNG image.');
    }

    console.log('Sending image to AI for analysis...');
    
    // Analyze disease using AI vision model
    const result = await analyzeDiseaseWithAI(image);

    console.log('AI analysis complete:', result.disease);

    // Add helpful suggestions based on result
    const suggestions = [
      'Take photos in good lighting conditions for better accuracy',
      'Capture close-up images of affected areas showing symptoms clearly',
      'Include both top and bottom sides of leaves if possible',
      'Avoid blurry or low-resolution images',
      'Ensure the affected area is clearly visible in the frame'
    ];

    return new Response(
      JSON.stringify({
        disease: result.disease,
        confidence: result.confidence,
        severity: result.severity,
        description: result.description,
        treatment: result.treatment,
        pesticides: result.pesticides || [],
        fertilizers: result.fertilizers || [],
        applicationTiming: result.applicationTiming || 'Follow product label instructions',
        preventiveMeasures: result.preventiveMeasures || 'Maintain good plant health practices',
        suggestions,
        timestamp: new Date().toISOString(),
        analysisMethod: 'AI Vision (Google Gemini 2.5 Flash)'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in detect-disease:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        suggestions: [
          'Ensure image is clear and well-lit',
          'Try uploading a different image',
          'Check your internet connection',
          'Image size should be less than 10MB',
          'Make sure the plant leaves or affected areas are clearly visible'
        ]
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
