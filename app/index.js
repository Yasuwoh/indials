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

function zeroPad (i) {
    if (i < 10) {
        i = "0" + i;
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
    if (el_minute_hand.style.display == "inline") {
        el_minute_hand.style.display = "none";
        el_hour_hand.style.display = "none";
        el_second_hand.style.display = "none";
    } else {
        el_minute_hand.style.display = "inline";
        el_hour_hand.style.display = "inline";
        el_second_hand.style.display = "inline";
    }
}
el_minute_hand.addEventListener ("click", toggleHandsDisplay);
el_hour_hand.addEventListener ("click", toggleHandsDisplay);
el_second_hand.addEventListener ("click", toggleHandsDisplay);
el_hand_axis.addEventListener ("click", toggleHandsDisplay);


// 時刻デジタル表示の更新
const el_date = document.getElementById('date');
const el_day = document.getElementById('day');
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
function renewClock_minutes (evt) {
    let today = evt.date;

    let month = today.getMonth();
    let date = today.getDate()
    el_date.text = `${month_names[month]} ${date}`;
    
    let day = today.getDay();
    el_day.text = day_names[day];

    let hours = today.getHours();
    if (preferences.clockDisplay === "12h") {
        hours = hours % 12 || 12;
    } else {
        hours = zeroPad (hours);
    }
    let mins = zeroPad (today.getMinutes());
    el_time.text = `${hours}:${mins}`;
}
clock.addEventListener ("tick", renewClock_minutes);


// 秒インダイヤルの更新
const el_secs_text = document.getElementById("secs_text");
const el_secs_indial = document.getElementById("secs_indial");
function renewClock_seconds (evt) {
    let today = evt.date;
    let seconds = today.getSeconds();
    el_secs_text.text = seconds;
    el_secs_indial.sweepAngle = 360 * seconds / 60;
}
clock.addEventListener ("tick", renewClock_seconds);


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