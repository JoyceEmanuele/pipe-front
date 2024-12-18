import { set } from 'date-fns';
import { TFunction } from 'i18next';
import { toast } from 'react-toastify';

export function validateStringTimeInterval(
  interval: {startTime?: string, endTime?: string},
  t: TFunction<'translation', undefined, 'translation'>,
): boolean {
  const { endTime, startTime } = interval;

  if (!startTime || !/^[0-2]\d:[0-5]\d$/.test(startTime)) {
    toast.error(t('erroHorarioInvalido'));
    return false;
  }
  if (!endTime || !/^[0-2]\d:[0-5]\d$/.test(endTime)) {
    toast.error(t('erroHorarioInvalido'));
    return false;
  }

  const startDate = set(new Date(), {
    hours: Number(startTime.split(':')[0]),
    minutes: Number(startTime.split(':')[1]),
    seconds: 0,
    milliseconds: 0,
  });

  const endDate = set(new Date(), {
    hours: Number(endTime.split(':')[0]),
    minutes: Number(endTime.split(':')[1]),
    seconds: 0,
    milliseconds: 0,
  });

  if (startDate >= endDate) {
    toast.error(t('erroHorarioInicioMenorHorarioFim'));
    return false;
  }

  return true;
}
