import { parseProgrammingString } from '~/helpers/scheduleData';
import { apiCall } from '~/providers';
import { colors } from '~/styles/colors';

export default async function checkDutsLimits<S extends {
  RTYPE_ID?: number
  Temperature?: number
}[]>(duts: S) {
  const { rtypes } = await apiCall('/clients/get-roomtypes-list', {});
  return duts.map((dut) => {
    const rtype = rtypes.find((x) => x.RTYPE_ID === dut.RTYPE_ID);
    const workPeriods = rtype && { ...rtype.workPeriods, ...rtype.workPeriodExceptions };

    let USEPERIOD_INDEX_INI: number|undefined;
    let USEPERIOD_INDEX_END: number|undefined;
    let specialColor: string|undefined;

    if (rtype && workPeriods && dut.Temperature != null) {
      const nowShifted = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const todayWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][nowShifted.getUTCDay()];
      const todayDate = nowShifted.toISOString().substr(0, 10);
      const todaySchedule = workPeriods[todayDate] || workPeriods[todayWeek];
      if (todaySchedule) {
        const pData = parseProgrammingString(todaySchedule);
        if ((!pData.isDefault) && pData.type === 'enabled') {
          const indexIni = Number(pData.startHM.substr(0, 2)) * 60 + Number(pData.startHM.substr(3, 2)) * 1;
          const indexEnd = Number(pData.endHM.substr(0, 2)) * 60 + Number(pData.endHM.substr(3, 2)) * 1;
          USEPERIOD_INDEX_INI = indexIni;
          USEPERIOD_INDEX_END = indexEnd;
          const nowIndex = nowShifted.getUTCHours() * 60 + nowShifted.getUTCMinutes() * 1;
          if (nowIndex >= indexIni && nowIndex <= indexEnd) {
            if (rtype.TUSEMIN != null && dut.Temperature < rtype.TUSEMIN) {
              specialColor = colors.LightBlue;
            }
            if (rtype.TUSEMAX != null && dut.Temperature > rtype.TUSEMAX) {
              specialColor = colors.Red;
            }
          }
        }
      }
    }

    return Object.assign(dut, {
      rtype,
      TUSEMIN: rtype && rtype.TUSEMIN,
      TUSEMAX: rtype && rtype.TUSEMAX,
      RTYPE_NAME: rtype && rtype.RTYPE_NAME,
      workPeriods,
      USEPERIOD_INDEX_INI,
      USEPERIOD_INDEX_END,
      specialColor,
    });
  });
}
