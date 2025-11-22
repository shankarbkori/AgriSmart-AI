import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Estimate soil pH based on climate zone and location
function estimateSoilPH(lat: number, lon: number, rainfall: number, temperature: number): number {
  let pH = 6.5; // Neutral default
  
  // High rainfall regions (tropical/monsoon) - more acidic
  if (rainfall > 1500) {
    pH = 5.8; // Acidic due to leaching
  }
  // Moderate rainfall (temperate) - neutral to slightly acidic
  else if (rainfall > 800) {
    pH = 6.5; // Neutral
  }
  // Low rainfall (arid/semi-arid) - alkaline
  else if (rainfall < 500) {
    pH = 7.5; // Alkaline
  }
  // Moderate-low rainfall
  else {
    pH = 7.0; // Slightly alkaline
  }
  
  // Adjust for specific regions
  // Tropical regions (between tropics) - more acidic
  if (lat >= -23.5 && lat <= 23.5) {
    pH = Math.max(5.5, pH - 0.5);
  }
  
  // Desert belts - more alkaline
  if (lat >= 15 && lat <= 35 && ((lon >= -20 && lon <= 60) || (lon >= -120 && lon <= -100))) {
    pH = Math.min(8.0, pH + 0.5);
  }
  
  // High temperature regions tend toward alkaline
  if (temperature > 30) {
    pH = Math.min(8.0, pH + 0.3);
  }
  
  // Round to 1 decimal place
  return Math.round(pH * 10) / 10;
}

// Fetch current rainfall from Open-Meteo (free, no API key required)
async function fetchCurrentRainfall(lat: number, lon: number): Promise<number> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=precipitation&timezone=auto`;
    
    console.log('Fetching current rainfall from Open-Meteo...');
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Open-Meteo current weather API error:', response.status);
      return 0;
    }
    
    const data = await response.json();
    const currentPrecipitation = data.current?.precipitation || 0;
    
    console.log(`Current precipitation: ${currentPrecipitation} mm`);
    return currentPrecipitation;
  } catch (error) {
    console.error('Error fetching current rainfall from Open-Meteo:', error);
    return 0;
  }
}

// Fetch historical rainfall data from Open-Meteo (free, no API key required)
async function fetchRainfallData(lat: number, lon: number): Promise<{ month: string; rainfall: number }[]> {
  try {
    // Get last 12 months of data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startStr}&end_date=${endStr}&daily=precipitation_sum&timezone=auto`;
    
    console.log('Fetching rainfall from Open-Meteo (free API)...');
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Open-Meteo API error:', response.status);
      return []; // Return empty array to indicate failure
    }
    
    const data = await response.json();
    
    // Calculate monthly rainfall
    const monthlyData: { [key: string]: number } = {};
    
    if (data.daily && data.daily.time && data.daily.precipitation_sum) {
      data.daily.time.forEach((dateStr: string, index: number) => {
        const date = new Date(dateStr);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = 0;
        }
        
        const precip = data.daily.precipitation_sum[index];
        if (precip && precip > 0) {
          monthlyData[monthKey] += precip;
        }
      });
    }
    
    // Convert to array and sort by date
    const monthlyArray = Object.entries(monthlyData)
      .map(([month, rainfall]) => ({
        month: new Date(month + '-01').toLocaleString('default', { month: 'short' }),
        rainfall: Math.round(rainfall)
      }))
      .sort((a, b) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a.month) - months.indexOf(b.month);
      })
      .slice(-12); // Get last 12 months
    
    console.log(`Monthly rainfall data fetched from Open-Meteo: ${monthlyArray.length} months`);
    return monthlyArray;
  } catch (error) {
    console.error('Error fetching rainfall data from Open-Meteo:', error);
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

      const mockLat = typeof lat === 'number' ? lat : 20;
      const mockLon = typeof lon === 'number' ? lon : 75;
      const mockTemp = 25;
      const estimatedPH = estimateSoilPH(mockLat, mockLon, annualRainfall, mockTemp);
      
      const mockData = {
        location: location || (typeof lat === 'number' && typeof lon === 'number' ? `${lat},${lon}` : 'Current Location'),
        temperature: mockTemp,
        feelsLike: 27,
        humidity: mockHumidity,
        pressure: 1013,
        windSpeed: 3.5,
        description: 'partly cloudy',
        visibility: 10000,
        cloudCover: 40,
        rainfall: Math.round(annualRainfall),
        ph: estimatedPH,
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

      // Return specific error messages for different failure cases
      if (response.status === 404) {
        throw new Error(`Location "${location || 'specified'}" not found. Please enter a valid city name.`);
      } else if (response.status === 401) {
        throw new Error('Weather service authentication failed. Please contact support.');
      } else if (response.status === 429) {
        throw new Error('Weather service rate limit exceeded. Please try again later.');
      }

      throw new Error(`Weather API request failed: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();

    // Get coordinates from OpenWeatherMap response
    const coordLat = data.coord.lat;
    const coordLon = data.coord.lon;
    
    // Derive current rainfall using multiple sources (OpenWeather + Open-Meteo)
    const openWeatherRain = data.rain?.['1h'] ?? 0;
    const description = (data.weather?.[0]?.description || '') as string;
    const isRainByDescription = /rain|drizzle|thunderstorm|shower/i.test(description);
    
    const openMeteoRain = await fetchCurrentRainfall(coordLat, coordLon);
    
    let currentRainfall = openWeatherRain || openMeteoRain;
    
    // If APIs report 0mm but description says it's raining, estimate intensity
    if (currentRainfall === 0 && isRainByDescription) {
      const descLower = description.toLowerCase();
      if (descLower.includes('heavy') || descLower.includes('intense')) {
        currentRainfall = 7.5; // heavy rain approx mm/h
      } else if (descLower.includes('moderate')) {
        currentRainfall = 2.5; // moderate rain approx mm/h
      } else {
        currentRainfall = 0.5; // light rain approx mm/h
      }
    }
    
    // Try to get accurate monthly rainfall from Open-Meteo (free, no API key needed)
    let monthlyRainfall: { month: string; rainfall: number }[] = [];
    monthlyRainfall = await fetchRainfallData(coordLat, coordLon);
    
    // If Open-Meteo failed, fall back to estimate
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

    // Calculate total rainfall from monthly data
    const totalRainfall = monthlyRainfall.reduce((sum, item) => sum + item.rainfall, 0);
    
    // Estimate soil pH based on location and climate
    const estimatedPH = estimateSoilPH(coordLat, coordLon, totalRainfall, Math.round(data.main.temp));
    
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
      currentRainfall: currentRainfall, // Current rainfall in mm from Open-Meteo
      monthlyRainfall: monthlyRainfall, // Monthly rainfall data
      ph: estimatedPH, // Estimated soil pH
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
