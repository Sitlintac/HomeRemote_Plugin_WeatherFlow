plugin.Name = "WeatherFlow";
plugin.OnChangeRequest = onChangeRequest;
plugin.OnConnect = onConnect;
plugin.OnDisconnect = onDisconnect;
plugin.OnPoll = onPoll;
plugin.OnSynchronizeDevices = onSynchronizeDevices;
//Poll once every 5 minutes (aka 300000 ms).
plugin.PollingInterval = 300000;
plugin.DefaultSettings = {
    "AccessToken": "", "StationID": "", "MetricUnits": "true"
};

var http = new HTTPClient();
const windDirections = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
const ICON_PREFIX = "weather-";
const ICON_SUFFIX = ".png";
//var observationsUrl;
var forecastUrl;
var metricUnits;



function onChangeRequest(device, attribute, value) {
}

function onConnect() {
    var token = plugin.Settings["AccessToken"];
    var stationId = getStationID();
    if (plugin.Settings["MetricUnits"] == "true") {
        metricUnits = true;
    } else {
        metricUnits = false;
    }

    //observationsUrl = "https://swd.weatherflow.com/swd/rest/observations/station/" + stationId + "&token=" + token;
    if (metricUnits) {
        forecastUrl = "https://swd.weatherflow.com/swd/rest/better_forecast?station_id=" + stationId + "&token=" + token;
    } else {
        forecastUrl = "https://swd.weatherflow.com/swd/rest/better_forecast?station_id=" + stationId + "&units_temp=f&units_wind=mph&units_pressure=inhg&units_precip=in&units_distance=mi&token=" + token;
    }
}

function onDisconnect() {
}

function onPoll() {
	console.log(forecastUrl);
    var response = http.get(forecastUrl);
    if (response.data.status.status_code != 0) {
        console.log("Error: " + response.data.status.status_message);
    }

    updateCurrentConditions(response.data.current_conditions);
    var hStart = 0; // for current day, we want to start with the first available hourly index...
    var hEnd = getHourlyIndexOfTimecode(response.data.forecast.daily[1].day_start_local, response.data.forecast.hourly);  // ...and we want to stop just before tomorrow's first index
    var i;
    for (d=0; d < 10; d++) {
        updateDailyForecast(d, response.data.forecast.daily[d]);
        if (d==0) {
            i = 24 - hEnd;
        } else {
            i = 0;
        }
        populateHourlyArray(d, hStart, hEnd, i, response.data.forecast.hourly); //hStart = current day's timecode; hEnd = next day's timecode; i = first index to populate in hourly forecast array
        hStart = hEnd;
        hEnd +=24; 
    }

    for (h=0; h < 24; h++) {
        updateHourlyForecast(h, response.data.forecast.hourly[h]);
    }
}

function onSynchronizeDevices() {
    plugin.Devices["WFCurrent"] = createCurrentCondDevice();
    plugin.Devices["WFDay0"] = createDayDevice(0);
    plugin.Devices["WFDay1"] = createDayDevice(1);
    plugin.Devices["WFDay2"] = createDayDevice(2);
    plugin.Devices["WFDay3"] = createDayDevice(3);
    plugin.Devices["WFDay4"] = createDayDevice(4);
    plugin.Devices["WFDay5"] = createDayDevice(5);
    plugin.Devices["WFDay6"] = createDayDevice(6);
    plugin.Devices["WFDay7"] = createDayDevice(7);
    plugin.Devices["WFDay8"] = createDayDevice(8);
    plugin.Devices["WFDay9"] = createDayDevice(9);
    plugin.Devices["WFHour0"] = createHourDevice(0);
    plugin.Devices["WFHour1"] = createHourDevice(1);
    plugin.Devices["WFHour2"] = createHourDevice(2);
    plugin.Devices["WFHour3"] = createHourDevice(3);
    plugin.Devices["WFHour4"] = createHourDevice(4);
    plugin.Devices["WFHour5"] = createHourDevice(5);
    plugin.Devices["WFHour6"] = createHourDevice(6);
    plugin.Devices["WFHour7"] = createHourDevice(7);
    plugin.Devices["WFHour8"] = createHourDevice(8);
    plugin.Devices["WFHour9"] = createHourDevice(9);
    plugin.Devices["WFHour10"] = createHourDevice(10);
    plugin.Devices["WFHour11"] = createHourDevice(11);
    plugin.Devices["WFHour12"] = createHourDevice(12);
    plugin.Devices["WFHour13"] = createHourDevice(13);
    plugin.Devices["WFHour14"] = createHourDevice(14);
    plugin.Devices["WFHour15"] = createHourDevice(15);
    plugin.Devices["WFHour16"] = createHourDevice(16);
    plugin.Devices["WFHour17"] = createHourDevice(17);
    plugin.Devices["WFHour18"] = createHourDevice(18);
    plugin.Devices["WFHour19"] = createHourDevice(19);
    plugin.Devices["WFHour20"] = createHourDevice(20);
    plugin.Devices["WFHour21"] = createHourDevice(21);
    plugin.Devices["WFHour22"] = createHourDevice(22);
    plugin.Devices["WFHour23"] = createHourDevice(23);
}

function getStationID() {
    if (plugin.Settings["StationID"] != "") {
        console.log("StationID of " + plugin.Settings["StationID"]);
        return plugin.Settings["StationID"];}
    else {
        var response = http.get("https://swd.weatherflow.com/swd/rest/stations?token=" + plugin.Settings["AccessToken"]);
        console.log("Station ID calculated as: " + response.data.stations[0].station_id);
        return response.data.stations[0].station_id;
    }
}

function updateCurrentConditions(currently) {
    var currentConditions = plugin.Devices["WFCurrent"];
    if (currentConditions != null) {
        console.log("currently: " + currently);
        currentConditions.Weather = getWeatherConditions(currently.conditions);
        console.log("Reported conditions of " + currently.conditions + " translated to " + getWeatherConditions(currently.conditions) + " and assigned as " + currentConditions.Weather);
        currentConditions.WeatherIcon = ICON_PREFIX + currently.icon + ICON_SUFFIX;
        currentConditions.Temperature = currently.air_temperature;
        console.log("Air temp reported as " + currently.air_temperature + " and assigned as " + currentConditions.Temperature);
        currentConditions.Pressure = currently.sea_level_pressure;
        currentConditions.StationPressure = currently.station_pressure;
        currentConditions.PressureTrend = currently.pressure_trend;
        currentConditions.Humidity = currently.relative_humidity;
        currentConditions.Wind = currently.wind_avg;
        currentConditions.WindDirectionDegrees = currently.wind_direction;
        currentConditions.WindDirection = convertAngleToDirection(currently.wind_direction);
        currentConditions.WindGust = currently.wind_gust;
        currentConditions.SolarRadiation = currently.solar_radiation;
        currentConditions.UltravioletIndex = currently.uv;
        currentConditions.Illuminance = currently.brightness;
        currentConditions.FeelsLike = currently.feels_like;
        currentConditions.DewPoint = currently.dew_point;
        currentConditions.WetBulbTemp = currently.wet_bulb_temperature;
        currentConditions.DeltaT = currently.delta_t;
        currentConditions.AirDensity = currently.air_density;
        currentConditions.LightningCount1hr = currently.lightning_strike_count_last_1hr;
        currentConditions.LightningCount3hr = currently.lightning_strike_count_last_3hr;
        currentConditions.LightningDistance = currently.lightning_strike_last_distance;
        currentConditions.LightningDistanceMessage = currently.lightning_strike_last_distance_msg;
        currentConditions.LightningStrikeEpoch = currently.lightning_strike_last_epoch; // Do something with this to make it more useful to the user.  Elapsed time?  Date/time?
        //currentConditions.PrecipitationRate = currently.precip; // I couldn't find documentation on what "precip" actually measures, but found another project where it's equated to rate so hopefully that's true.  This is in Observations, not Forecast.
        currentConditions.PrecipitationLevel = currently.precip_accum_local_day;
        currentConditions.PrecipitationLevelYesterday = currently.precip_accum_local_yesterday;
        currentConditions.PrecipitationMinutesToday = currently.precip_minutes_local_day;
        currentConditions.PrecipitationMinutesYesterday = currently.precip_minutes_local_day;

    }
}

function updateDailyForecast(d,dayData) {
    var dayDevice = plugin.Devices["WFDay" + d];
    console.log("Getting forecast for day " + d);

    if (dayDevice != null) {
        if (dayData != null) {
            dayDevice.Day = dayData.day_num;
            console.log("Day number is " + dayData.day_num + " and recorded as " + dayDevice.Day);
            dayDevice.Month = dayData.month_num;
            dayDevice.DayOfWeek = convertUnixTimeToDayOfWeek(dayData.day_start_local);
			dayDevice.Weather = getWeatherConditions(dayData.conditions);
            console.log("Forecast of " + dayData.conditions + " recorded as: " + dayDevice.Weather);
			dayDevice.WeatherIcon = ICON_PREFIX + dayData.icon + ICON_SUFFIX;
            console.log("Icon of " + dayData.icon + " recorded as: " + dayDevice.WeatherIcon);
			dayDevice.Sunrise = convertUnixTimeToLocalTime(dayData.sunrise);
            dayDevice.Sunset = convertUnixTimeToLocalTime(dayData.sunset);
            dayDevice.TemperatureHigh = dayData.air_temp_high;
            dayDevice.TemperatureLow = dayData.air_temp_low;
            dayDevice.PrecipitationProbability = dayData.precip_probability;
			dayDevice.PrecipitationType = dayData.precip_type;
        } else {
            //Let's consider the possibility the response doesn't have data for all 7 days.
            //If it doesn't, let's reset the device data so we don't continue to display old data.
            dayDevice.Day = null;
            dayDevice.Month = null;
            dayDevice.DayOfWeek = null;
			dayDevice.Weather = null;
			dayDevice.WeatherIcon = null;
			dayDevice.Sunrise = null;
            dayDevice.Sunset = null;
            dayDevice.TemperatureHigh = null;
            dayDevice.TemperatureLow = null;
            dayDevice.PrecipitationProbability = null;
			dayDevice.PrecipitationType = null;
        }
    }

    console.log("Completed forecast update for day " + d);

}

function updateHourlyForecast(h,hourlyData) {
    var hourDevice = plugin.Devices["WFHour" + h];

    if (hourDevice != null) {
        if (hourlyData != null) {
            hourDevice.DayNum = hourlyData.local_day;
            hourDevice.Hour = convertUnixTimeToLocalTime(hourlyData.time);
			hourDevice.Weather = getWeatherConditions(hourlyData.conditions);
            console.log("Forecast is for: " + hourDevice.Weather);
			hourDevice.WeatherIcon = hourlyData.icon;
            hourDevice.Temperature = hourlyData.air_temperature;
            hourDevice.Pressure = hourlyData.sea_level_pressure;
            hourDevice.Humidity = hourlyData.relative_humidity;
            hourDevice.PrecipitationProbability = hourlyData.precip_probability;
            hourDevice.Wind = hourlyData.wind_avg;
            hourDevice.WindDirectionDegrees = hourlyData.wind_direction;
            hourDevice.WindDirection = convertAngleToDirection(hourDevice.WindDirectionDegrees);
            hourDevice.WindGust = hourlyData.wind_gust;
            hourDevice.UltravioletIndex = hourlyData.uv;
            hourDevice.FeelsLike = hourlyData.feels_like;
        } else {
            hourDevice.DayNum = null;
            hourDevice.HourNum = null;
			hourDevice.Weather = null;
            console.log("Forecast is for: " + hourDevice.Weather);
			hourDevice.WeatherIcon = null;
            hourDevice.Temperature = null;
            hourDevice.Pressure = null;
            hourDevice.Humidity = null;
            hourDevice.PrecipitationProbability = null;
            hourDevice.Wind = null;
            hourDevice.WindDirectionDegrees = null;
            hourDevice.WindDirection = null;
            hourDevice.WindGust = null;
            hourDevice.UltravioletIndex = null;
            hourDevice.FeelsLike = null;
        }
    }

}


function populateHourlyArray(d, hStart, hEnd, i, hourlyData) {
    var dayDevice = plugin.Devices["WFDay" + d];
    var hourlyForecast = [];

    //For current day, fill already elapsed hours with null data since there's no forecast for them
    for (pastHour = 0; pastHour <i; pastHour++) {
        let newEntry = {
            "Id":i,
            "Description":"--",
            "Icon": ""
        }
        hourlyForecast[pastHour] = newEntry;
    }

    //For the future, fill future hours with their forecasts
    for (h = hStart; h < hEnd; h++) {
        let newEntry = {
            "Id":i,
            "Description":hourlyData[h].air_temperature + "\xB0",
            "Icon": ICON_PREFIX + hourlyData[h].icon + ICON_SUFFIX
        }
        hourlyForecast[i] = newEntry;
        i++;
    }

    dayDevice.HourlyForecast = hourlyForecast;
}

function getWeatherConditions(weather) {
    switch(weather) {
        case "Clear":
            console.log("Weather is clear.");
            return "Clear";
        case "Rain Likely":
        case "Rain Possible":
            return "Rain";
        case "Snow":
        case "Snow Possible":
            return "Snow";
        case "Wintry Mix Likely":
        case "Wintry Mix Possible":
            return "RainSnow";
        case "Thunderstorms Likely":
        case "Thunderstorms Possible":
            return "Thunderstorm";
        case "Windy":
            return "Windy";
        case "Foggy":
            return "Fog";
        case "Cloudy":
            return "Cloudy";
        case "Partly Cloudy":
            return "PartlyCloudy";
        case "Very Light Rain":
            return "Showers";
        default:
            console.log("Weather hit default without finding a match.");
            return "Exceptional";
    }
}

function getHourlyIndexOfTimecode(timecode, hourlyData) {
    for (i=0; i<100; i++) {
        if (hourlyData[i].time == timecode) return i;
    }
    return null;
}

function createCurrentCondDevice() {
    var pluginDevice = new Device();
    pluginDevice.Id = "WFCurrent";
    pluginDevice.DisplayName = "Current Conditions";
    pluginDevice.Name = "CurrentConditions";
    pluginDevice.Capabilities =  ["IlluminanceMeasurement", "PrecipitationLevelMeasurement", "PrecipitationRateMeasurement", "PressureMeasurement", "RelativeHumidityMeasurement", "TemperatureMeasurement", "UltravioletIndex", "WindDirectionMeasurement", "WindGustMeasurement", "WindMeasurement"];
    pluginDevice.Attributes = ["Weather", "WeatherIcon", "StationPressure", "PressureTrend", "WindDirectionDegrees", "SolarRadiation", "FeelsLike", "DewPoint", "WetBulbTemp", "DeltaT", "AirDensity", "LightningCount1hr", "LightningCount3hr", "LightningDistance", "LightningDistanceMessage", "LightningStrikeEpoch", "PrecipitationLevelYesterday", "PrecipitationMinutesToday", "PrecipitationMinutesYesterday"];
    return pluginDevice;
}

function createDayDevice(number) {
    var pluginDevice = new Device();
    pluginDevice.Id = "WFDay" + number;
    pluginDevice.DisplayName = "Forecast Day "+ number;
    pluginDevice.DeviceType = "ForecastDay";
    pluginDevice.Icon = "Thermometer";
    pluginDevice.TileTemplate = "ForecastDayTile.xaml";
    pluginDevice.DetailsTemplate = "ForecastDayDetails.xaml";
    pluginDevice.Capabilities = [];
    pluginDevice.Attributes = ["Day", "Month", "DayOfWeek", "Weather", "WeatherIcon", "Sunrise", "Sunset", "TemperatureHigh", "TemperatureLow", "PrecipitationProbability", "PrecipitationType", "HourlyForecast"];
    return pluginDevice;
}

function createHourDevice(number) {
    var pluginDevice = new Device();
    pluginDevice.Id = "WFHour" + number;
    pluginDevice.DisplayName = "Forecast Hour "+ number;
    pluginDevice.DeviceType = "ForecastHour";
    pluginDevice.Icon = "Thermometer";
    pluginDevice.TileTemplate = "ForecastHourTile.xaml";
    pluginDevice.DetailsTemplate = "ForecastHourDetails.xaml";
    pluginDevice.Capabilities = ["PressureMeasurement", "RelativeHumidityMeasurement", "TemperatureMeasurement", "UltravioletIndex", "WindDirectionMeasurement", "WindGustMeasurement", "WindMeasurement"];
    pluginDevice.Attributes = ["DayNum", "Hour", "Weather", "WeatherIcon", "PrecipitationProbability", "FeelsLike"];
    return pluginDevice;
}

function convertAngleToDirection(angle) {
    var index = parseInt((angle + 23) / 45);
    if (index < windDirections.length) {
        return windDirections[index];
    }
    return "Unknown"
}

function convertUnixTimeToDayOfWeek(unixTime) {
    var jsDate = new Date(unixTime * 1000);
    switch (jsDate.getDay()) {
        case 0:
            return "Sunday";
        case 1:
            return "Monday";
        case 2:
            return "Tuesday";
        case 3:
            return "Wednesday";
        case 4:
            return "Thursday";
        case 5:
            return "Friday";
        case 6:
            return "Saturday";
        default:
            return "Unknown";
    }
}

function convertUnixTimeToLocalTime(unixTime) {
    var jsDate = new Date(unixTime * 1000);
    var hr = jsDate.getHours();
    var min  = jsDate.getMinutes();
    if (min < 10) {
        min = "0" + min;
    }
    var ampm = "AM";
    if( hr > 12 ) {
        hr -= 12;
        ampm = "PM";
    }
    var time = hr + ":" + min + " " + ampm;
    return time;
}

