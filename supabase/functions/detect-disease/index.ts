import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Disease database with descriptions and treatments
const diseaseDatabase = {
  'Healthy': {
    description: 'The plant appears to be healthy with no visible signs of disease or stress.',
    treatment: 'Continue regular maintenance and monitoring. Ensure proper watering and nutrition.',
    severity: 'Low'
  },
  'Leaf Blight': {
    description: 'Fungal disease causing brown or tan spots on leaves, often with a yellow halo.',
    treatment: 'Apply fungicide containing mancozeb or copper. Remove infected leaves. Improve air circulation.',
    severity: 'Medium'
  },
  'Powdery Mildew': {
    description: 'White powdery spots on leaves and stems caused by fungal infection.',
    treatment: 'Apply sulfur-based fungicide. Increase spacing between plants. Water at base of plants.',
    severity: 'Medium'
  },
  'Bacterial Wilt': {
    description: 'Bacterial infection causing rapid wilting and yellowing of leaves.',
    treatment: 'Remove and destroy infected plants. Avoid overhead watering. Use disease-resistant varieties.',
    severity: 'High'
  },
  'Mosaic Virus': {
    description: 'Viral disease causing mottled yellow and green patterns on leaves.',
    treatment: 'No cure available. Remove infected plants. Control aphids that spread the virus.',
    severity: 'High'
  },
  'Root Rot': {
    description: 'Fungal disease affecting roots, causing wilting and yellowing despite adequate water.',
    treatment: 'Improve drainage. Reduce watering frequency. Apply fungicide to soil. Remove affected plants.',
    severity: 'High'
  },
  'Rust': {
    description: 'Orange or reddish-brown pustules on leaves caused by fungal infection.',
    treatment: 'Apply fungicide with copper or sulfur. Remove infected leaves. Ensure good air circulation.',
    severity: 'Medium'
  },
  'Anthracnose': {
    description: 'Dark, sunken lesions on leaves, stems, or fruits caused by fungal infection.',
    treatment: 'Remove infected plant parts. Apply copper-based fungicide. Avoid overhead irrigation.',
    severity: 'High'
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
              text: `You are an expert plant pathologist. Analyze this plant image and identify any diseases or health issues. 
              
Respond with ONLY a JSON object in this exact format (no other text):
{
  "disease": "name of disease or 'Healthy' if no disease",
  "confidence": 0.0-1.0,
  "severity": "Low", "Medium", or "High"
}

Common diseases to check for: Leaf Blight, Powdery Mildew, Bacterial Wilt, Mosaic Virus, Root Rot, Rust, Anthracnose, or Healthy.`
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
  
  // Get disease details from database
  const diseaseInfo = diseaseDatabase[analysis.disease as keyof typeof diseaseDatabase] || diseaseDatabase['Healthy'];
  
  return {
    disease: analysis.disease,
    confidence: analysis.confidence,
    severity: analysis.severity || diseaseInfo.severity,
    description: diseaseInfo.description,
    treatment: diseaseInfo.treatment
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
        ...result,
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
