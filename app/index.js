console.log('Hello world!');

import clock from "clock";
import * as document from "document";
import {preferences } from "user-settings";
import { battery } from "power";

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
const arc_secs = document.getElementById("secs_indial");
function renewClock_seconds (evt) {
    let today = evt.date;
    let seconds = today.getSeconds();
    el_secs_text.text = seconds;
    arc_secs.sweepAngle = 360 * seconds / 60;
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
