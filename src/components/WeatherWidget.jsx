import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Cloud, Wind, Droplets, MapPin, Loader2, Zap, Eye, Thermometer } from 'lucide-react';

const API_KEY = 'adb0f8b62c489ecf4ef0c6862b1a2347';

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [city, setCity] = useState('New Delhi');
  const [inputCity, setInputCity] = useState('');

  const fetchWeather = async (lat, lon, cityName = null) => {
    setLoading(true);
    setError(null);
    try {
      let url = cityName 
        ? `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`
        : `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Location not found');
      const data = await res.json();
      
      // Fetch forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&units=metric&appid=${API_KEY}`
      );
      const forecastData = await forecastRes.json();
      
      setWeather({ current: data, forecast: forecastData });
      if (cityName) setCity(data.name);
    } catch (err) {
      setError('Could not fetch weather. Please try another city.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initWeather = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
          (err) => {
            console.warn("Geolocation denied, falling back to New Delhi", err);
            fetchWeather(28.6139, 77.2090, 'New Delhi');
          }
        );
      } else {
        fetchWeather(28.6139, 77.2090, 'New Delhi');
      }
    };
    initWeather();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputCity.trim()) {
      fetchWeather(null, null, inputCity.trim());
      setInputCity('');
    }
  };

  if (loading) return (
    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '3rem' }}>
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
      <span style={{ color: 'var(--color-text-muted)' }}>Syncing with SkyPort...</span>
    </div>
  );

  const current = weather?.current;
  const forecast = weather?.forecast?.list?.filter((_, i) => i % 8 === 0).slice(0, 3) || [];

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--color-primary-dim)', padding: '0.5rem', borderRadius: '12px' }}>
          <CloudRain size={24} style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-text-main)' }}>Regional Weather</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            <MapPin size={14} /> {current?.name || city}, India
          </div>
        </div>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          className="input-field"
          placeholder="Enter village or city..."
          value={inputCity}
          onChange={e => setInputCity(e.target.value)}
          style={{ flex: 1, height: '45px' }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0 1.25rem', height: '45px' }}>
          Check
        </button>
      </form>

      {error && <p style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

      {current && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img 
              src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`} 
              alt="weather" 
              style={{ width: '80px', height: '80px', filter: 'drop-shadow(0 0 10px rgba(74, 222, 128, 0.3))' }}
            />
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>{Math.round(current.main.temp)}°</div>
              <div style={{ color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{current.weather[0].description}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-bg-dark)', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ color: 'var(--color-primary)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Humidity</div>
              <div style={{ fontWeight: 600 }}>{current.main.humidity}%</div>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-bg-dark)', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ color: 'var(--color-primary)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Wind</div>
              <div style={{ fontWeight: 600 }}>{Math.round(current.wind.speed * 3.6)}k/h</div>
            </div>
          </div>
        </div>
      )}

      {forecast.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {forecast.map((day, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '1rem 0.5rem', backgroundColor: 'var(--color-bg-elevated)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                {new Date(day.dt * 1000).toLocaleDateString('en', { weekday: 'short' })}
              </div>
              <img 
                src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`} 
                alt="forecast" 
                style={{ width: '40px', margin: '0 auto' }}
              />
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{Math.round(day.main.temp_max)}°</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{Math.round(day.main.temp_min)}°</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
