import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enJson from './locales/en/translation.json';
import ptBRJson from './locales/pt-br/translation.json';
import LanguageDetector from 'i18next-browser-languagedetector';

// const DETECTION_OPTIONS = {
//   order: ['navigator', 'querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
// };

declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
  }
}

i18n.use(initReactI18next)
  // .use(LanguageDetector)
  .init({
    returnNull: false,
    // detection: DETECTION_OPTIONS,
    lng: 'pt',
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: true,
    },
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p', 'span'],
    resources: {
      en: {
        translation: enJson,
      },
      pt: {
        translation: ptBRJson,
      },
    },
  });

export default i18n;
