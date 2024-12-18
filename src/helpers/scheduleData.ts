import { DayProg } from 'providers/types';
import { t } from 'i18next';

interface ProgData {
  type: string,
  startHM: string,
  endHM: string,
  desc: string,
  isDefault: boolean,
}

export function parseProgrammingString(pString: string) {
  const pData: ProgData = {
    type: 'disabled', startHM: '00:00', endHM: '23:59', desc: t('diaTodo'), isDefault: true,
  };
  if (pString) {
    const rgx = /^(\w+)(;(\d\d:\d\d)-(\d\d:\d\d))?$/;
    const matched = pString.match(rgx);
    if (matched) {
      const [, , period, startHM, endHM] = matched;
      let [, type] = matched;
      if (type === 'allow') type = 'enabled';
      if (type === 'forbid') type = 'disabled';
      if (['disabled', 'enabled'].includes(type)) pData.type = type;
      else {
        console.log('Invalid programming string:', pString);
      }
      if (period) {
        pData.startHM = startHM;
        pData.endHM = endHM;
      }
      pData.isDefault = false;
    } else {
      console.log('Invalid programming string:', pString);
    }
  }
  fillDescription(pData);
  return pData;
}

export function fillDescription(pData: ProgData) {
  const wholeDay = (pData.startHM === '00:00') && (pData.endHM === '23:59');
  if (wholeDay) {
    if (pData.type === 'enabled') pData.desc = t('diaTodo');
    else if (pData.type === 'disabled') pData.desc = t('naoMonitorado');
    else pData.desc = t('desconhecido');
    return;
  }
  if (pData.type === 'enabled') pData.desc = t('horarioAte', { startHM: pData.startHM, endHM: pData.endHM });
  else pData.desc = t('desconhecido');
}

export function describeDay(dayString: string) {
  if (dayString === 'mon') return t('diaSeg');
  if (dayString === 'tue') return t('diaTer');
  if (dayString === 'wed') return t('diaQua');
  if (dayString === 'thu') return t('diaQui');
  if (dayString === 'fri') return t('diaSex');
  if (dayString === 'sat') return t('diaSab');
  if (dayString === 'sun') return t('diaDom');
  if (dayString.match(/^\d\d\d\d-\d\d-\d\d$/)) {
    return `${dayString.substr(0, 4)}/${dayString.substr(5, 2)}/${dayString.substr(8, 2)}`;
  }
  return dayString;
}

export function getDaySched(workPeriods: { [day: string]: string }, workPeriodExceptions: { [day: string]: string }, day?: string) {
  const asDate = day ? new Date(`${day}T00:00:00Z`) : new Date(Date.now() - 3 * 60 * 60 * 1000);
  const dayWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][asDate.getUTCDay()];
  const dayDate = asDate.toISOString().substr(0, 10);
  const sched = { ...workPeriods, ...workPeriodExceptions };
  const todaySchedule = sched && (sched[dayDate] || sched[dayWeek]);
  const pData = parseProgrammingString(todaySchedule);
  return pData;
}

export function getDayProgDesc(dayProgInfo: DayProg|null) {
  // {"permission":"allow","start":"07:30","end":"17:05"}
  const modes: { [k: string]: string } = {
    allow: t('permitido'),
    forbid: t('desligado').toLocaleLowerCase(),
  };
  if (!dayProgInfo) return t('semInformacoes');
  if (dayProgInfo.clearProg) return t('semProgramacao');
  if (dayProgInfo.permission && dayProgInfo.start && dayProgInfo.end) {
    if (dayProgInfo.permission === 'allow') {
      return `${t('horarioDeAte', { start: dayProgInfo.start, end: dayProgInfo.end })}`.replace(t('de00.00ate23.59'), t('diaTodo'));
    }
    return `${modes[dayProgInfo.permission] || dayProgInfo.permission} ${t('horarioEntre', { start: dayProgInfo.start, end: dayProgInfo.end })}`.replace(` ${t('entre00.00e23.59')}`, ` ${t('diaTodo')}`);
  }

  return t('semInformacoes');
}
