import { t } from 'i18next';

export const controlColumnsConfig = [
  { id: 'ALARM_CODE', visible: true, label: t('codigo') },
  { id: 'START_DATE', visible: true, label: t('dataInicio') },
  { id: 'END_DATE', visible: true, label: t('dataFinal') },
  { id: 'DESCRIPTION', visible: true, label: t('descricao') },
  { id: 'REASON_ALARM', visible: false, label: t('porqueAlarmeGerado') },
  { id: 'ACTION_TAKEN', visible: false, label: t('acaoRealizada') },
  { id: 'RESET_TYPE', visible: false, label: t('tipoReset') },
  { id: 'CAUSE', visible: false, label: t('causa') },
];