import i18n from '~/i18n';

export function getUserLanguage(): string {
  return i18n.language === 'pt' ? 'pt-BR' : 'en';
}
