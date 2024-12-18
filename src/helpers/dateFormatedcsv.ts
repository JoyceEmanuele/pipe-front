import moment from 'moment';
import { formatNumberWithFractionDigits } from './thousandFormatNumber';

interface ICSVData {
    devId?: string;
    clientId?: number;
    clientName?: string;
    unitId?: number;
    unitName?: string;
    avgDisp?: number;
    groupName?: string;
    roomName?: string;
    startDate?: string;
    endDate?: string;
    dispList: {
        disponibility: number;
        YMD: string;
    }[];
}

export async function processDataAndDownloadCSV(data: ICSVData[]) {
  const formattedCSV = [] as any;
  const daysOfTheWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  data.forEach((item) => {
    item.dispList.forEach((disp) => {
      const day = daysOfTheWeek[moment(disp.YMD).day()];
      formattedCSV.push({
        cliente: item.clientName,
        unidade: item.unitName,
        id: item.unitId || item.devId,
        maquina: item.groupName,
        ambiente: item.roomName,
        disponibilidade: formatNumberWithFractionDigits(disp.disponibility?.toFixed(1)),
        dia: ` ${day}, ${moment(disp.YMD).format('DD-MM-YYYY')}`,
      });
    });
  });

  formattedCSV.sort((a, b) => {
    const [d1, m1, y1] = a.dia.split(', ')[1].split('-');
    const [d2, m2, y2] = b.dia.split(', ')[1].split('-');
    return moment(`${y1}-${m1}-${d1}`).diff(moment(`${y2}-${m2}-${d2}`));
  });

  return formattedCSV;
}
