import { settingsStorage } from "settings";
import * as messaging from "messaging";
import { me as companion } from "companion";
import weather from "weather";

console.log('Hello world!');

// Settings have been changed
settingsStorage.addEventListener("change", (evt) => {
    sendValue(evt.key, evt.newValue);
});
  
// Settings were changed while the companion was not running
if (companion.launchReasons.settingsChanged) {
    // Send the value of the setting
    sendValue(KEY_COLOR, settingsStorage.getItem(KEY_COLOR));
}
  
function sendValue(key, val) {
    if (val) {
        sendSettingData({
            key: key,
            value: JSON.parse(val)
        });
    }
}
function sendSettingData(data) {
    // If we have a MessageSocket, send the data to the device
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        console.log(`Sending data: ${data}`)
        messaging.peerSocket.send(data);
    } else {
        console.log("No peerSocket connection");
    }
}

if (companion.permissions.granted("access_location")) {
    function outputWeather() {
        weather
            .getWeatherData()
            .then((data) => {
                if (data.locations.length > 0) {
                    const temp = Math.floor(data.locations[0].currentWeather.temperature);
                    const cond = data.locations[0].currentWeather.weatherCondition;
                    const loc = data.locations[0].name;
                    const unit = data.temperatureUnit;
                    console.log(`It's ${temp}\u00B0 ${unit} and ${cond} in ${loc}`);
                }
            })
            .catch((ex) => {
            console.error(ex);
            });
    }
    companion.wakeInterval = 1000 * 60 * 5;
    companion.addEventListener("wakeinterval", outputWeather);
    outputWeather();
}
