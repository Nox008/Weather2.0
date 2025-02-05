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
import './WeatherApp.css';

const WeatherApp = () => {
    const inputRef = useRef();
    const [weatherData, setWeatherData] = useState(false);
    const [loading, setLoading] = useState(true);

    const getCountryName = (countryCode) => {
        try {
            const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
            return regionNames.of(countryCode);
        } catch (error) {
            return countryCode;
        }
    };

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
        "11d": rainIcon,
        "11n": rainIcon,
        "13d": snowIcon,
        "13n": snowIcon,
    };

    const getBackgroundStyle = (weatherIcon) => {
        switch (weatherIcon) {
            case "01d":
            case "01n":
                return "bg-gradient-to-br from-blue-400 to-blue-600";
            case "02d":
            case "02n":
            case "03d":
            case "03n":
            case "04d":
            case "04n":
                return "bg-gradient-to-br from-gray-300 to-gray-500";
            case "09d":
            case "09n":
            case "10d":
            case "10n":
                return "bg-gradient-to-br from-gray-500 to-white";
            case "11d":
            case "11n":
                return "bg-gradient-to-br from-gray-900 to-gray-700";
            case "13d":
            case "13n":
                return "bg-gradient-to-br from-blue-400 to-white";
            default:
                return "bg-gradient-to-br from-[#2f4680] to-[#500ae4]";
        }
    };

    const getTextColor = (weatherIcon) => {
        if (weatherIcon === "13d" || weatherIcon === "13n") {
            return "text-black";
        }
        if (weatherIcon === "11d" || weatherIcon === "11n") {
            return "text-white";
        }
        return "text-white";
    };

    const getIntensity = (weatherDescription) => {
        if (weatherDescription.includes("light")) return "light";
        if (weatherDescription.includes("heavy")) return "heavy";
        return "moderate";
    };

    const getLocalTime = (timezone) => {
        const now = new Date();
        const localTime = now.getTime() + now.getTimezoneOffset() * 60000 + timezone * 1000;
        const date = new Date(localTime);

        // Format the date and time as "Feb 1, 10.00 AM"
        const options = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
        return date.toLocaleString('en-US', options);
    };

    const searchByCoordinates = async (latitude, longitude) => {
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (!response.ok) {
                toast(data.message);
                search("Kochi");
                return;
            }

            const icon = allIcons[data.weather[0].icon] || sunIcon;
            setWeatherData({
                humidity: data.main.humidity,
                wind: data.wind.speed,
                temperature: Math.floor(data.main.temp),
                location: data.name,
                country: getCountryName(data.sys.country),
                icon: icon,
                description: data.weather[0].description,
                feelsLike: Math.floor(data.main.feels_like),
                weatherIcon: data.weather[0].icon,
                intensity: getIntensity(data.weather[0].description.toLowerCase()),
                timezone: data.timezone,
            });
        } catch (error) {
            console.error("Error fetching data by coordinates:", error);
            search("Kochi");
        } finally {
            setLoading(false);
        }
    };

    const getUserLocation = () => {
        if ("geolocation" in navigator) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    searchByCoordinates(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    toast("Couldn't get your location. Showing default city.");
                    search("Kochi");
                    setLoading(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        } else {
            toast("Geolocation is not supported by your browser");
            search("Kochi");
            setLoading(false);
        }
    };

    const search = async (city) => {
        setLoading(true);
        if (city === '') {
            toast("Enter City Name");
            setLoading(false);
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
                country: getCountryName(data.sys.country),
                icon: icon,
                description: data.weather[0].description,
                feelsLike: Math.floor(data.main.feels_like),
                weatherIcon: data.weather[0].icon,
                intensity: getIntensity(data.weather[0].description.toLowerCase()),
                timezone: data.timezone,
            });
        } catch (error) {
            setWeatherData(false);
            console.error("Error fetching data");
            toast('An Error Occurred!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUserLocation();
    }, []);

    return (
        <div className={`flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 ${weatherData ? getBackgroundStyle(weatherData.weatherIcon) : "bg-gradient-to-br from-[#2f4680] to-[#500ae4]"}`}>
            {/* Rain Animation */}
            {weatherData && (weatherData.weatherIcon === "09d" || weatherData.weatherIcon === "09n" || weatherData.weatherIcon === "10d" || weatherData.weatherIcon === "10n" || weatherData.weatherIcon === "11d" || weatherData.weatherIcon === "11n") && (
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

            {/* Thunderstorm Animation */}
            {weatherData && (weatherData.weatherIcon === "11d" || weatherData.weatherIcon === "11n") && (
                <div className="thunderstorm">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className={`lightning ${['intense', 'moderate', 'distant'][index]}`}
                            style={{
                                animationDelay: `${Math.random() * 5}s`,
                            }}
                        ></div>
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
                    <div className="flex gap-2">
                        <img
                            src={searchIcon}
                            alt="Search"
                            className="w-10 h-10 p-2 rounded-full bg-white/90 cursor-pointer hover:bg-white/80 transition-all hover:scale-105"
                            onClick={() => search(inputRef.current.value)}
                        />
                        <button
                            onClick={getUserLocation}
                            className="h-10 px-3 rounded-full bg-white/90 text-gray-700 hover:bg-white/80 transition-all hover:scale-105 flex items-center justify-center"
                            title="Get current location"
                        >
                            📍
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                        <p className="text-white mt-4">Loading weather data...</p>
                    </div>
                ) : weatherData && (
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
                        <div className="mb-6 sm:mb-8">
                            <p className={`${getTextColor(weatherData.weatherIcon)} text-2xl sm:text-3xl font-semibold mb-1`}>
                                {weatherData.location}
                            </p>
                            <p className={`${getTextColor(weatherData.weatherIcon)} text-sm sm:text-base opacity-75`}>
                                {weatherData.country}
                            </p>
                            <p className={`${getTextColor(weatherData.weatherIcon)} text-sm sm:text-base opacity-75`}>
                                {getLocalTime(weatherData.timezone)}
                            </p>
                        </div>

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