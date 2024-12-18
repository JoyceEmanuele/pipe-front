import { t } from 'i18next';
import { NewOption } from './types';
import { toast } from 'react-toastify';
import { apiCall } from 'providers';

export const MIN_LTI_SETPOINT_SCHEDULE = 15;

export const defaultActionModeOptions: NewOption[] = [
  { label: t('habilitado'), value: t('habilitado') },
  { label: t('ventilacao'), value: t('ventilacao') },
  { label: t('eco'), value: t('eco') },
];
export const defaultActionPostModeOptions: NewOption[] = [
  { label: t('habilitado'), value: t('habilitado') },
  { label: t('ventilacao'), value: t('ventilacao') },
  { label: t('modoDesligar'), value: t('modoDesligar') },
  { label: t('semAcao'), value: t('semAcao') },
];

export const defaultActionModes = {
  [t('eco')]: 'ECO',
  [t('habilitado')]: 'Enabled',
  [t('ventilacao')]: 'Ventilation',
  [t('modoDesligar')]: 'Disabled',
  [t('semAcao')]: 'NoAction',
};

export const getOptionByKey = (action: string, options: NewOption[]): NewOption => options.find((item) => item.value === action) as NewOption;

export const getCoolSetpointDefaultCommandValue = (devId: string,
  irCommands: {
    IR_ID: string,
    CMD_NAME: string,
    CMD_TYPE: string | null,
    TEMPER: number,
  }[]): number | undefined => {
  let setpointDefault: number | undefined;
  const acCoolCommand = irCommands.find((command) => command.CMD_TYPE === 'AC_COOL');

  if (acCoolCommand?.TEMPER) {
    setpointDefault = acCoolCommand.TEMPER;
  } else {
    const defaultCommand = irCommands.find((command) => command.TEMPER === 21);
    setpointDefault = defaultCommand?.TEMPER ?? undefined;

    if (defaultCommand && devId) {
      apiCall('/define-ircode-action', {
        devId,
        IR_ID: defaultCommand.IR_ID,
        CMD_TYPE: 'AC_COOL',
        CMD_DESC: '',
        TEMPER: defaultCommand.TEMPER,
      }).then(() => {
        irCommands.push({ ...defaultCommand, CMD_TYPE: 'AC_COOL' });
      }).catch((err) => {
        console.error(err);
        toast.error(t('erroDefinirIRAcCool'));
      });
    }
  }

  if (!setpointDefault) {
    toast.info(t('avisoIrSetpointNaoEncontradoModoRefrigerar'));
  }

  return setpointDefault;
};
