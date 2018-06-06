import { Injectable } from '@angular/core';
import cloneDeep from 'lodash/cloneDeep';

import { Schedule } from 'app-engine';

@Injectable()
export class ScheduleAdapterService {

  constructor(
  ) {
  }

  public toTimezoneSchedule(schedule: Schedule, offset: number): Schedule {
    return this.adaptSchedule(schedule, offset);
  }

  public toUTCSchedule(schedule: Schedule, offset: number): Schedule {
    return this.adaptSchedule(schedule, offset, true);
  }

  private adaptSchedule(schedule: Schedule, offset: number = 0, toUTC: boolean = false): Schedule {
    let result = cloneDeep(schedule);
    if (offset === 0) return result;

    offset = toUTC ? offset : -offset;
    let offsetPair = this.parseOffset(offset);

    // start time
    let startTime = this.shiftTime(schedule.start, offsetPair);

    // end time
    let endTime = this.shiftTime(schedule.end, offsetPair);

    // days
    let days = Array.isArray(schedule.days) ? schedule.days : [];
    if (days.length > 0) {
      let t = startTime.originH + offsetPair.hOffset;
      if (t < 0 || t >= 24) {
        days = this.shiftWeekDays(days, offset < 0 ? -1 : 1);
      }
    }

    result.start = this.padLeft(startTime.h, 2) + ':' + this.padLeft(startTime.m, 2);
    result.end = this.padLeft(endTime.h, 2) + ':' + this.padLeft(endTime.m, 2);
    result.days = days;
    return result;
  }

  private parseOffset(offset: number): { hOffset: number, mOffset: number } {
    let hOffset = offset / 60 | 0;
    let mOffset = offset % 60;

    return { hOffset, mOffset };
  }

  private shiftTime(time: string, offsetPair: { hOffset: number, mOffset: number } = { hOffset: 0, mOffset: 0 }): { h: number, m: number, originH: number, originM: number } {
    let sTime = time.split(':');
    let originH = Number.parseInt(sTime[0]);
    let hour = (originH + offsetPair.hOffset + 24) % 24;
    let originM = Number.parseInt(sTime[1]);
    let min = (originM + offsetPair.mOffset + 60) % 60;

    return { h: hour, m: min, originH, originM };
  }

  private shiftWeekDays(days: Array<number> = [], delta: number): Array<number> {
    return days
      .map((value) => {
        let newValue = value + delta;
        if (newValue > 7) return 1;
        if (newValue < 1) return 7;
        return newValue;
      })
      .sort();
  }

  private padLeft(str, len) {
    str = '' + str;
    return str.length >= len ? str : new Array(len - str.length + 1).join('0') + str;
  }

  public setScheduleForOneShot(utcSchedule: Schedule, executeNow: boolean = false, offset: number = 0): Schedule {
    const schedule = this.toTimezoneSchedule(utcSchedule, offset);

    // offset = -offset;
    const offsetPair = this.parseOffset(offset);

    // start time
    const startTime = this.shiftTime(schedule.start, offsetPair);

    // end time
    const endTime = this.shiftTime(schedule.end, offsetPair);

    const current: Date = new Date();
    const curTs = current.getTime();

    current.setHours(startTime.originH);
    current.setMinutes(startTime.originM);
    current.setSeconds(1);
    let startTs = current.getTime();

    const startDateShift: boolean = curTs >= startTs;
    const isOverlapping = this.isOverlapping(utcSchedule, offset);
    if ((isOverlapping && !executeNow) || (!isOverlapping && startDateShift)) {
      startTs += 24 * 60 * 60 * 1000;
    }

    const startDate = new Date(startTs);
    startDate.setHours(endTime.originH);
    startDate.setMinutes(endTime.originM);
    let endTs = startDate.getTime();

    const endDateShift: boolean = startTs >= endTs;
    if (endDateShift) {
      endTs += 24 * 60 * 60 * 1000;
    }

    const endDate = new Date(endTs);

    const ts = Math.floor(endDate.getTime() / 1000);

    const result = cloneDeep(schedule);
    result.days = [startDate.getDay()];
    result.active_until = ts;

    return this.toUTCSchedule(result, offset);
  }

  public setActiveUntil(UTCSchedule: Schedule, executeNow: boolean = false, offset: number = 0) {
    let result = cloneDeep(UTCSchedule);

    if (this.isOneShot(UTCSchedule)) {
      result = this.setScheduleForOneShot(UTCSchedule, executeNow, offset);
    } else {
      result.active_until = null;
    }

    return result;
  }

  private getTimeWithBaseDate(timeString: string, baseDate: Date = new Date()) {
    const time = timeString.split(':');
    const timeHour =  Number.parseInt(time[0]);
    const timeMinutes =  Number.parseInt(time[1]);

    baseDate.setHours(timeHour);
    baseDate.setMinutes(timeMinutes);

    return baseDate.getTime();
  }

  public isOverlapping(UTCSchedule: Schedule, offset: number = 0): boolean {
    if (!this.isOneShot(UTCSchedule) && UTCSchedule.days.length > 0) {
      const today = new Date().getUTCDay();
      if (!UTCSchedule.days.find(day => day === today)) {
        return false;
      }
    }

    const current: Date = new Date();
    const curTs = current.getTime();
    const schedule = this.toTimezoneSchedule(UTCSchedule, offset);
    const startTs = this.getTimeWithBaseDate(schedule.start, current);
    const startDate = new Date(startTs);
    let endTs = this.getTimeWithBaseDate(schedule.end, startDate);
    const endDateShift: boolean = startTs >= endTs;
    if (endDateShift) {
      endTs += 24 * 60 * 60 * 1000;
    }

    return (endTs >= curTs && curTs >= startTs);
  }

  public isOutOfDate(schedule: Schedule): boolean {
    if (schedule.active === 1 &&
      schedule.active_until && schedule.active_until > 0) {
      let ts = Date.now() / 1000 | 0;
      return ts > schedule.active_until;
    }
    return false;
  }

  public isOneShot(schedule: Schedule): boolean {
    return schedule.active_until && schedule.active_until > 0 && schedule.days.length === 1;
  }
}
