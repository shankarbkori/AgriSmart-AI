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
      rainfall: data.rain?.['1h'] ? data.rain['1h'] * 30 * 24 : 800, // Estimate monthly rainfall
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
