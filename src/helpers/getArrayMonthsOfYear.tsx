import { t } from 'i18next';

export const getArrayMonthsOfYear = (): string[] => {
  const months: string[] = [t('mesesDoAno.jan'), t('mesesDoAno.fev'), t('mesesDoAno.mar'), t('mesesDoAno.abr'), t('mesesDoAno.mai'), t('mesesDoAno.jun'), t('mesesDoAno.jul'), t('mesesDoAno.ago'), t('mesesDoAno.set'), t('mesesDoAno.out'), t('mesesDoAno.nov'), t('mesesDoAno.dez')];

  return months;
};
