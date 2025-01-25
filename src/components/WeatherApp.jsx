import React, { useEffect, useRef, useState } from 'react';
import searchIcon from '../assets/search.svg';
import cloudIcon from '../assets/cloudy.svg';
import drizzleIcon from '../assets/drizzle.svg';
import humidIcon from '../assets/humidiy.svg';
import rainIcon from '../assets/rainy.svg';
import snowIcon from '../assets/snowy.svg';
import sunIcon from '../assets/sunny.svg';
import windIcon from '../assets/wind.svg';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './WeatherApp.css'; // Import custom CSS for animations

const WeatherApp = () => {
    const inputRef = useRef();
    const [weatherData, setWeatherData] = useState(false);

    const allIcons = {
        "01d": sunIcon,
        "01n": sunIcon,
        "02d": cloudIcon,
        "02n": cloudIcon,
        "03d": cloudIcon,
        "03n": cloudIcon,
        "50d": cloudIcon,
        "50n": cloudIcon,
        "04d": drizzleIcon,
        "04n": drizzleIcon,
        "09d": rainIcon,
        "09n": rainIcon,
        "10d": rainIcon,
        "10n": rainIcon,
        "13d": snowIcon,
        "13n": snowIcon,
    };

    const getBackgroundStyle = (weatherIcon) => {
        switch (weatherIcon) {
            case "01d": // Sunny
            case "01n":
                return "bg-gradient-to-br from-blue-400 to-blue-600";
            case "02d": // Cloudy
            case "02n":
            case "03d":
            case "03n":
            case "04d":
            case "04n":
                return "bg-gradient-to-br from-gray-300 to-gray-500";
            case "09d": // Rainy
            case "09n":
            case "10d":
            case "10n":
                return "bg-gradient-to-br from-gray-500 to-white";
            case "13d": // Snowy
            case "13n":
                return "bg-gradient-to-br from-blue-300 to-white"; // Slight bluish-white background
            default:
                return "bg-gradient-to-br from-[#2f4680] to-[#500ae4]"; // Default gradient
        }
    };

    const getTextColor = (weatherIcon) => {
        if (weatherIcon === "13d" || weatherIcon === "13n") {
            return "text-black"; // Black text for snowy weather
        }
        return "text-white"; // White text for other weather conditions
    };

    const getIntensity = (weatherDescription) => {
        if (weatherDescription.includes("light")) return "light";
        if (weatherDescription.includes("heavy")) return "heavy";
        return "moderate"; // Default intensity
    };

    const search = async (city) => {
        if (city === '') {
            toast("Enter City Name");
            return;
        }
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
            const response = await fetch(url);
            const data = await response.json();
            if (!response.ok) {
                toast(data.message);
                return;
            }
            const icon = allIcons[data.weather[0].icon] || sunIcon;
            setWeatherData({
                humidity: data.main.humidity,
                wind: data.wind.speed,
                temperature: Math.floor(data.main.temp),
                location: data.name,
                icon: icon,
                description: data.weather[0].description,
                feelsLike: Math.floor(data.main.feels_like),
                weatherIcon: data.weather[0].icon, // Store the weather icon code
                intensity: getIntensity(data.weather[0].description.toLowerCase()), // Determine intensity
            });
        } catch (error) {
            setWeatherData(false);
            console.error("Error fetching data");
            toast('An Error Occurred!');
        }
    };

    useEffect(() => {
        search("Kochi");
    }, []);

    return (
        <div className={`flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 ${weatherData ? getBackgroundStyle(weatherData.weatherIcon) : "bg-gradient-to-br from-[#2f4680] to-[#500ae4]"}`}>
            {/* Rain Animation */}
            {weatherData && (weatherData.weatherIcon === "09d" || weatherData.weatherIcon === "09n" || weatherData.weatherIcon === "10d" || weatherData.weatherIcon === "10n") && (
                <div className={`rain ${weatherData.intensity}`}>
                    {Array.from({ length: weatherData.intensity === "light" ? 50 : weatherData.intensity === "heavy" ? 150 : 100 }).map((_, index) => (
                        <div key={index} className="raindrop" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }}></div>
                    ))}
                </div>
            )}

            {/* Snow Animation */}
            {weatherData && (weatherData.weatherIcon === "13d" || weatherData.weatherIcon === "13n") && (
                <div className={`snow ${weatherData.intensity}`}>
                    {Array.from({ length: weatherData.intensity === "light" ? 50 : weatherData.intensity === "heavy" ? 150 : 100 }).map((_, index) => (
                        <div key={index} className="snowflake" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }}></div>
                    ))}
                </div>
            )}

            <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-xl p-6 sm:p-8 shadow-2xl border border-white/10 relative z-10">
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 sm:mb-8">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search City"
                        className="flex-1 h-12 px-4 rounded-full bg-white/90 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full sm:w-auto"
                    />
                    <img
                        src={searchIcon}
                        alt="Search"
                        className="w-10 h-10 p-2 rounded-full bg-white/90 cursor-pointer hover:bg-white/80 transition-all hover:scale-105 mt-3 sm:mt-0"
                        onClick={() => search(inputRef.current.value)}
                    />
                </div>

                {weatherData && (
                    <div className="text-center">
                        <img
                            src={weatherData.icon}
                            alt="Weather Icon"
                            className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 animate-pulse"
                        />
                        <p className={`${getTextColor(weatherData.weatherIcon)} text-lg sm:text-xl font-semibold capitalize mb-2`}>
                            {weatherData.description}
                        </p>
                        <p className={`${getTextColor(weatherData.weatherIcon)} text-6xl sm:text-7xl font-bold my-4 sm:my-6`}>
                            {weatherData.temperature}°C
                        </p>
                        <p className={`${getTextColor(weatherData.weatherIcon)} text-base sm:text-lg mb-4`}>
                            Feels Like: {weatherData.feelsLike}°C
                        </p>
                        <p className={`${getTextColor(weatherData.weatherIcon)} text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8`}>
                            {weatherData.location}
                        </p>

                        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6 mt-6 sm:mt-8">
                            <div className="flex flex-col items-center bg-white/10 rounded-lg p-4 w-full sm:w-1/2 backdrop-blur-sm">
                                <img src={humidIcon} alt="Humidity" className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
                                <span className={`${getTextColor(weatherData.weatherIcon)} text-base sm:text-lg`}>{weatherData.humidity}%</span>
                                <span className={`${getTextColor(weatherData.weatherIcon)} text-sm`}>Humidity</span>
                            </div>
                            <div className="flex flex-col items-center bg-white/10 rounded-lg p-4 w-full sm:w-1/2 backdrop-blur-sm">
                                <img src={windIcon} alt="Wind" className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
                                <span className={`${getTextColor(weatherData.weatherIcon)} text-base sm:text-lg`}>{weatherData.wind} Km/h</span>
                                <span className={`${getTextColor(weatherData.weatherIcon)} text-sm`}>Wind</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Toast Container */}
            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
        </div>
    );
};

export default WeatherApp;