# HomeRemote_Plugin_WeatherFlow
Weather Flow integration for Home Remote; allows read-only access to one weather station (access token required).  The plugin will fetch your weather station's current observations as well as its weather forecast.

## Plugin Settings:
- **Access Token**: Your Personal Access Token, required to access your weather station.  Log in to the Tempest Web App at tempestwx.com, then go to Settings -> Data Authorizations -> Create Token to generate this.
- **StationID**: *[optional]* If you have more than one weather station associated with your account, you can specify the ID of the station you want this plugin to access.
- **Metric Units**: Boolean value.  Default of "true" returns results in metric units; any other value returns results in Imperial units.

##Virtual Devices Created
-- **CurrentConditions**: a device of type "WeatherStation" that is populated with your weather station's observations
-- **ForecastDay0** to **ForecastDay9**: ten devices of type "ForecastDay" that are populated with your weather station's forecasts for today's weather (ForecastDay0) and the next nine days (ForecastDay1 through ForecastDay9)
-- **ForecastHour0** to **ForecastHour23**: twenty-four devices of type "ForecastHour" that are populated with your weather station's detailed forecast for the next 24 hours

## WeatherStation device capabilities:
- **IlluminanceMeasurement**
- **PrecipitationLevelMeasurement**
- **PrecipitationRateMeasurement**
- **PressureMeasurement**
- **RelativeHumidityMeasurement**
- **TemperatureMeasurement**
- **UltravioletIndex**
- **WindDirectionMeasurement**
- **WindGustMeasurement**
- **WindMeasurement**

## WeatherStation device attributes:
-- **AirDensity**
-- **DeltaT**
-- **DewPoint**
-- **FeelsLike**
-- **LightningCount1hr**
-- **LightningCount3hr**
-- **LightningDistance**
-- **LightningDistanceMessage**
-- **LightningStrikeEpoch**
-- **PrecipitationLevelYesterday**
-- **PrecipitationMinutesToday**
-- **PrecipitationMinutesYesterday**
-- **PressureTrend**: Possible values: falling, steady, rising, unknown
-- **SolarRadiation**
-- **StationPressure**
-- **Weather**: Possible values: Clear, Rain, Snow, RainSnow, Thunderstorm, Windy, Fog, Cloudy, PartlyCloudy, Showers, Exceptional
-- **WeatherIcon**: A string value beginning with a prefix and ending with a suffix, both of which are set as constants in the plugin (currently "weather-" and ".png", respectively). Possible values: clear-day, clear-night, cloudy, foggy, partly-cloudy-day, partly-cloudy-night, possibly-rainy-day, possibly-rainy-night, possibly-sleet-day, possibly-sleet-night, possibly-snow-day, possibly-snow-night, possibly-thunderstorm-day, possibly-thunderstorm-night, rainy, sleet, snow, thunderstorm, windy.
-- **WetBlubTemp**
-- **WindDirectionDegrees**

## ForecastDay device capabilities:
None.

## ForecastDay device attributes:
-- **Day**
-- **Month**
-- **DayOfWeek**
-- **Weather**: See "WeatherStation device attributes" above
-- **WeatherIcon**: See "WeatherStation device attributes" above
-- **Sunrise**: Sunrise in local time
-- **Sunset**: Sunset in local time
-- **TemperatureHigh**
-- **TemperatureLow**
-- **PrecipitationProbability**: Probability of precipitation, given in percent chance
-- **PrecipitationType**: Possible values: rain, snow, sleet, storm
-- **HourlyForecast**: An array containing the basic forecast for each hour of the day.  Each entry in the array contains an "Id" (hour of the day, where 0 = midnight and 23 = 11pm), a "Description" (predicted temperature), and an "Icon" (see "WeatherIcon" for possible values).  For ForecastDay0, which contains today's forecast, hours that have already elapsed are assigned "--" in the Description field and "" in the Icon field.  The **HourlyForecast** array is designed to be displayed in a GridView.

## ForecastHour device capabilities:
-- **PressureMeasurement**
-- **RelativeHumidityMeasurement**
-- **TemperatureMeasurement**
-- **UltravioletIndex**
-- **WindDirectionMeasurement**
-- **WindGustMeasurement**
-- **WindMeasurement**

## ForecastHour device attributes:
-- **DayNum**
-- **Hour**
-- **Weather**
-- **WeatherIcon**
-- **PrecipitationProbability**
-- **FeelsLike**


