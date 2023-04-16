console.log('Hello world!');

import clock from "clock";
import * as document from "document";
import {preferences } from "user-settings";
import { battery } from "power";
import { me as appbit } from "appbit";
import { HeartRateSensor } from "heart-rate";
import { today, goals } from "user-activity";
import { display } from "display";

clock.granularity = "seconds";

function padWith (i, pad) {
    if (i < 10) {
        i = pad + i;
    }
    return i;
}


// 時計の針の更新
const el_minute_hand = document.getElementById('minute-hand');
const el_hour_hand = document.getElementById('hour-hand');
const el_second_hand = document.getElementById('second-hand');
function renewClockHands (evt) {
    let today = evt.date;
    let hour = today.getHours();
    let minute = today.getMinutes();
    let second = today.getSeconds();

    el_minute_hand.groupTransform.rotate.angle = (360 * minute / 60) + (360 / 60 * second / 60);
    el_hour_hand.groupTransform.rotate.angle = (360 * hour / 12) % 360 + (360 / 12 * minute / 60);
    el_second_hand.groupTransform.rotate.angle = 360 * second / 60;
}
clock.addEventListener ("tick", renewClockHands);
// 針か軸をタップしたら針の表示をトグルする
const el_hand_axis = document.getElementById("hand_axis");
function toggleHandsDisplay (evt) {
    if (el_minute_hand.style.display == "none") {
        el_minute_hand.style.display = "inline";
        el_hour_hand.style.display = "inline";
        el_second_hand.style.display = "inline";
    } else {
        el_minute_hand.style.display = "none";
        el_hour_hand.style.display = "none";
        el_second_hand.style.display = "none";
    }
}
el_minute_hand.addEventListener ("click", toggleHandsDisplay);
el_hour_hand.addEventListener ("click", toggleHandsDisplay);
el_second_hand.addEventListener ("click", toggleHandsDisplay);
el_hand_axis.addEventListener ("click", toggleHandsDisplay);


// 時刻デジタル表示の更新
const el_date = document.getElementById('date');
const el_day = document.getElementById('day');
const el_dateday = document.getElementById('dateday');
const el_time = document.getElementById('time');
const month_names = {
    0: 'JAN',
    1: 'FEB',
    2: 'MAR',
    3: 'APR',
    4: 'MAY',
    5: 'JUN',
    6: 'JUL',
    7: 'AUG',
    8: 'SEP',
    9: 'OCT',
    10: 'NOV',
    11: 'DEC',
};
const day_names = {
    0: 'SUN',
    1: 'MON',
    2: 'TUE',
    3: 'WED',
    4: 'THU',
    5: 'FRI',
    6: 'SAT',
}
function renewClockDigits (evt) {
    let today = evt.date;

    let month = today.getMonth();
    let date = today.getDate()
    el_date.text = `${month_names[month]} ${date}`;
    
    let day = today.getDay();
    el_day.text = day_names[day];

    el_dateday.text = `${day_names[day]} ${date} ${month_names[month]}`

    let time = "";
    let hours = today.getHours();
    let mins_2d = padWith (today.getMinutes(), "0");
    if (preferences.clockDisplay === "12h") {
        let ampm = hours < 12 ? 'AM' : 'PM';
        let hours_2d = padWith ((hours-1) % 12 + 1, " ");
        time = `${hours_2d}:${mins_2d} ${ampm}`;
    } else {
        hours_2d = padWith (hours, " ");
        time = `${hours}:${mins_2d}`;
    }
    el_time.text = time;
}
clock.addEventListener ("tick", renewClockDigits);
// 時刻部分をタップしたら表示をトグルする
function ToggleTimeDisplay (evt) {
    if (el_time.style.fill == "black") {
        el_time.style.fill = "white";
    } else {
        el_time.style.display = "black";
    }
    console.log("test");
}
//el_time.addEventListener ("click", ToggleTimeDisplay);


// 秒インダイヤルの更新
const el_secs_text = document.getElementById("secs_text");
const el_secs_indial = document.getElementById("secs_indial");
    if (el_secs_text && el_secs_indial) {
    function renewClock_seconds (evt) {
        let today = evt.date;
        let seconds = today.getSeconds();
        el_secs_text.text = seconds;
        el_secs_indial.sweepAngle = 360 * seconds / 60;
    }
    clock.addEventListener ("tick", renewClock_seconds);
}


// バッテリー残量の更新
const el_battery = document.getElementById("battery");
function renewBattery (evt) {
    let battery_fill = "gray";
    if (battery.chargeLevel >= 50) {
        battery_fill = "green";
    } else if (battery.chargeLevel >= 30) {
        battery_fill = "yellow";
    } else {
        battery_fill = "red";
    }
    el_battery.style.fill = battery_fill;

    let battery_angle = Math.floor( battery.chargeLevel * 30 / 100 );
    el_battery.startAngle = 60 - battery_angle;
    el_battery.sweepAngle = battery_angle;
}
clock.addEventListener ("tick", renewBattery);


// 心拍数の更新
const el_heartrate_text = document.getElementById("heartrate_text");
if (HeartRateSensor && appbit.permissions.granted("access_heart_rate")) {
  const hrm = new HeartRateSensor();
  hrm.addEventListener("reading", () => {
    el_heartrate_text.text = hrm.heartRate;
  });
  display.addEventListener("change", () => {
    // Automatically stop the sensor when the screen is off to conserve battery
    display.on ? hrm.start() : hrm.stop();
  });
  hrm.start();
}

// 歩数の更新
const el_steps_text = document.getElementById("steps_text");
const el_steps_progress = document.getElementById("steps_progress");
if (today && appbit.permissions.granted("access_activity")) {
    function renewSteps (evt) {
        let steps = today.adjusted.steps || 0;
        let goal = goals.steps;
        el_steps_text.text = steps;
        if (steps > goal) {
            el_steps_progress.sweepAngle = 360;
        } else {
            el_steps_progress.sweepAngle = 360 * steps / goal;
        }
    }
    clock.addEventListener ("tick", renewSteps);
}

// カロリーの更新
const el_calories_text = document.getElementById("calories_text");
const el_calories_progress = document.getElementById("calories_progress");
if (today && appbit.permissions.granted("access_activity")) {
    function renewCalories (evt) {
        let calories = today.adjusted.calories || 0;
        let goal = goals.calories;
        el_calories_text.text = calories;
        if (calories > goal) {
            el_calories_progress.sweepAngle = 360;
        } else {
            el_calories_progress.sweepAngle = 360 * calories / goal;
        }
    }
    clock.addEventListener ("tick", renewCalories);
}

// AZMの更新
const el_azm_text = document.getElementById("azm_text");
const el_azm_progress = document.getElementById("azm_progress");
if (today && appbit.permissions.granted("access_activity")) {
    function renewAzm (evt) {
        let azm = today.adjusted.activeZoneMinutes.total || 0;
        let goal = goals.activeZoneMinutes.total;
        el_azm_text.text = azm;
        if (azm > goal) {
            el_azm_progress.sweepAngle = 360;
        } else {
            el_azm_progress.sweepAngle = 360 * azm / goal;
        }
    }
    clock.addEventListener ("tick", renewAzm);
}

// 距離の更新
const el_distance_text = document.getElementById("distance_text");
const el_distance_progress = document.getElementById("distance_progress");
if (today && appbit.permissions.granted("access_activity")) {
    function renewDistance (evt) {
        let distance = today.adjusted.distance || 0;
        let goal = goals.distance;
        el_distance_text.text = distance;
        if (distance > goal) {
            el_distance_progress.sweepAngle = 360;
        } else {
            el_distance_progress.sweepAngle = 360 * distance / goal;
        }
    }
    clock.addEventListener ("tick", renewDistance);
}

// 昇降の更新
const el_floors_text = document.getElementById("floors_text");
const el_floors_progress = document.getElementById("floors_progress");
if (today && appbit.permissions.granted("access_activity")) {
    function renewFloors (evt) {
        let floors = today.adjusted.elevationGain || 0;
        let goal = goals.elevationGain;
        el_floors_text.text = floors;
        if (floors > goal) {
            el_floors_progress.sweepAngle = 360;
        } else {
            el_floors_progress.sweepAngle = 360 * floors / goal;
        }
    }
    clock.addEventListener ("tick", renewFloors);
}
