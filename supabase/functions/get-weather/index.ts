import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fetch historical rainfall data from Visual Crossing (monthly)
async function fetchRainfallData(lat: number, lon: number, apiKey: string): Promise<{ month: string; rainfall: number }[]> {
  try {
    // Get last 12 months of data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}/${startStr}/${endStr}?unitGroup=metric&include=days&key=${apiKey}&contentType=json`;
    
    console.log('Fetching rainfall from Visual Crossing...');
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Visual Crossing API error:', response.status);
      return []; // Return empty array to indicate failure
    }
    
    const data = await response.json();
    
    // Calculate monthly rainfall
    const monthlyData: { [key: string]: number } = {};
    
    if (data.days && Array.isArray(data.days)) {
      data.days.forEach((day: any) => {
        const date = new Date(day.datetime);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = 0;
        }
        
        if (day.precip) {
          monthlyData[monthKey] += day.precip;
        }
      });
    }
    
    // Convert to array and sort by date
    const monthlyArray = Object.entries(monthlyData)
      .map(([month, rainfall]) => ({
        month: new Date(month + '-01').toLocaleString('default', { month: 'short', year: 'numeric' }),
        rainfall: Math.round(rainfall)
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
    
    console.log(`Monthly rainfall data fetched: ${monthlyArray.length} months`);
    return monthlyArray;
  } catch (error) {
    console.error('Error fetching rainfall data:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, lat, lon } = await req.json();
    console.log('Fetching weather for:', location || `${lat},${lon}`);

    const openWeatherApiKey = Deno.env.get('OPENWEATHER_API_KEY')?.trim();
    const visualCrossingApiKey = Deno.env.get('VISUAL_CROSSING_API_KEY')?.trim();
    
    if (!openWeatherApiKey) {
      // Return mock data if API key not configured
      console.log('No OpenWeather API key found, returning mock data');

      // Estimate rainfall using provided coordinates when available
      let annualRainfall = 900; // Default moderate
      if (typeof lat === 'number' && typeof lon === 'number') {
        if (lat >= -23.5 && lat <= 23.5) annualRainfall = 1800; // Tropics
        else if ((lat > 23.5 && lat <= 40) || (lat < -23.5 && lat >= -40)) annualRainfall = 900; // Temperate
        else if (lat >= 15 && lat <= 35 && ((lon >= -20 && lon <= 60) || (lon >= -120 && lon <= -100))) annualRainfall = 250; // Desert belts
      }
      const mockHumidity = 65;
      if (mockHumidity < 40) annualRainfall *= 0.6;
      else if (mockHumidity > 70) annualRainfall *= 1.2;

      const mockData = {
        location: location || (typeof lat === 'number' && typeof lon === 'number' ? `${lat},${lon}` : 'Current Location'),
        temperature: 25,
        feelsLike: 27,
        humidity: mockHumidity,
        pressure: 1013,
        windSpeed: 3.5,
        description: 'partly cloudy',
        visibility: 10000,
        cloudCover: 40,
        rainfall: Math.round(annualRainfall),
        source: 'mock',
      };
      
      return new Response(
        JSON.stringify(mockData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch real weather data from OpenWeatherMap
    let url;
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${openWeatherApiKey}&units=metric`;
    }
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenWeatherMap API error:', response.status, errorData);

      // Graceful fallback: return mock data for invalid key or rate limit
      if (response.status === 401 || response.status === 429) {
        // Estimate rainfall using provided coordinates when available
        let annualRainfall = 900; // Default moderate
        if (typeof lat === 'number' && typeof lon === 'number') {
          if (lat >= -23.5 && lat <= 23.5) annualRainfall = 1800; // Tropics
          else if ((lat > 23.5 && lat <= 40) || (lat < -23.5 && lat >= -40)) annualRainfall = 900; // Temperate
          else if (lat >= 15 && lat <= 35 && ((lon >= -20 && lon <= 60) || (lon >= -120 && lon <= -100))) annualRainfall = 250; // Desert belts
        }
        const mockHumidity = 65;
        if (mockHumidity < 40) annualRainfall *= 0.6;
        else if (mockHumidity > 70) annualRainfall *= 1.2;

        const mockData = {
          location: location || (lat && lon ? `${lat},${lon}` : 'Current Location'),
          temperature: 25,
          feelsLike: 27,
          humidity: mockHumidity,
          pressure: 1013,
          windSpeed: 3.5,
          description: 'partly cloudy',
          visibility: 10000,
          cloudCover: 40,
          rainfall: Math.round(annualRainfall),
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

    // Get coordinates from OpenWeatherMap response
    const coordLat = data.coord.lat;
    const coordLon = data.coord.lon;
    
    // Try to get accurate monthly rainfall from Visual Crossing
    let monthlyRainfall: { month: string; rainfall: number }[] = [];
    if (visualCrossingApiKey) {
      monthlyRainfall = await fetchRainfallData(coordLat, coordLon, visualCrossingApiKey);
    }
    
    // If Visual Crossing failed or no API key, fall back to estimate
    if (monthlyRainfall.length === 0) {
      console.log('Using estimated monthly rainfall based on climate zones');
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
      
      // Create estimated monthly distribution (simple average for now)
      const monthlyAvg = Math.round(annualRainfall / 12);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthlyRainfall = months.map(month => ({
        month,
        rainfall: monthlyAvg
      }));
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
      monthlyRainfall: monthlyRainfall, // Monthly rainfall data
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
