// Simulated weather data; replace with real API later
const getWeather = async () => {
  return {
    temperature: 25,
    condition: 'Sunny',
    location: 'Farm Area',
  };
};

module.exports = { getWeather };
