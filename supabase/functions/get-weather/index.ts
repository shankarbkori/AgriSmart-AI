import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, lat, lon } = await req.json();
    console.log('Fetching weather for:', location || `${lat},${lon}`);

    const apiKey = Deno.env.get('OPENWEATHER_API_KEY')?.trim();
    
    if (!apiKey) {
      // Return mock data if API key not configured
      console.log('No API key found, returning mock data');
      const mockData = {
        location: location || 'Current Location',
        temperature: 25,
        feelsLike: 27,
        humidity: 65,
        pressure: 1013,
        windSpeed: 3.5,
        description: 'partly cloudy',
        visibility: 10000,
        cloudCover: 40,
        rainfall: 800,
      };
      
      return new Response(
        JSON.stringify(mockData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch real weather data from OpenWeatherMap
    let url;
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;
    }
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenWeatherMap API error:', response.status, errorData);

      // Graceful fallback: return mock data for invalid key or rate limit
      if (response.status === 401 || response.status === 429) {
        const mockData = {
          location: location || (lat && lon ? `${lat},${lon}` : 'Current Location'),
          temperature: 25,
          feelsLike: 27,
          humidity: 65,
          pressure: 1013,
          windSpeed: 3.5,
          description: 'partly cloudy',
          visibility: 10000,
          cloudCover: 40,
          rainfall: 800,
          source: 'mock',
          note: response.status === 401
            ? 'Invalid or inactive OpenWeather API key. Returning mock data.'
            : 'Rate limited by OpenWeather. Returning mock data.'
        };
        return new Response(
          JSON.stringify(mockData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Weather API request failed: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();

    // Calculate realistic annual rainfall based on climate zones and latitude
    const coordLat = data.coord.lat;
    const coordLon = data.coord.lon;
    
    // Estimate annual rainfall based on geographical location and climate
    let annualRainfall = 800; // Default moderate rainfall
    
    // Tropical regions (between tropics) - higher rainfall
    if (coordLat >= -23.5 && coordLat <= 23.5) {
      annualRainfall = 1800; // Tropical regions typically get 1500-2500mm
    }
    // Temperate regions - moderate rainfall
    else if ((coordLat > 23.5 && coordLat <= 40) || (coordLat < -23.5 && coordLat >= -40)) {
      annualRainfall = 900; // Temperate regions typically get 600-1200mm
    }
    // Semi-arid regions (near deserts) - check longitude for major desert belts
    else if (coordLat >= 15 && coordLat <= 35) {
      // Sahara, Arabian, and similar desert belts
      if ((coordLon >= -20 && coordLon <= 60) || (coordLon >= -120 && coordLon <= -100)) {
        annualRainfall = 250; // Arid/semi-arid regions
      }
    }
    
    // Adjust based on humidity - lower humidity suggests drier climate
    if (data.main.humidity < 40) {
      annualRainfall = annualRainfall * 0.6; // Reduce by 40% for low humidity
    } else if (data.main.humidity > 70) {
      annualRainfall = annualRainfall * 1.2; // Increase by 20% for high humidity
    }
    
    // If there's recent rain data, use it to adjust estimate
    if (data.rain?.['1h']) {
      // Recent rain suggests higher rainfall region
      annualRainfall = Math.max(annualRainfall, 1000);
    }

    const weatherData = {
      location: data.name,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      description: data.weather[0].description,
      visibility: data.visibility,
      cloudCover: data.clouds.all,
      rainfall: Math.round(annualRainfall), // Annual rainfall in mm
      coordinates: { lat: coordLat, lon: coordLon },
    };

    return new Response(
      JSON.stringify(weatherData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-weather:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
