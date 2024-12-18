import { getUserLanguage } from './languageHelper';

export function thousandPointFormat(value, verifyIsNull?: boolean): string {
  if (verifyIsNull && !value) {
    return value;
  }
  const language = getUserLanguage();
  return Math.round(value).toLocaleString(language, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatNumberWithFractionDigits(
  value: number | string,
  digits?: { minimum: number; maximum: number },
): string {
  let numberValue = Number(value);
  const language = getUserLanguage();

  if (!Number.isNaN(numberValue)) {
    return numberValue.toLocaleString(language, {
      minimumFractionDigits: digits ? digits.minimum : 0,
      maximumFractionDigits: digits ? digits.maximum : 1,
    });
  }

  // Se a conversão para número falhar, tentamos extrair o número usando regex
  // para casos em que os campos já vem com unidade na string, ex 24.5km
  const stringValue = String(value).replace(',', '.');
  const regex = /([-+]?\d*\.?\d+)([^\d.-]*)/;
  const match = regex.exec(stringValue);

  if (!match) return value != null ? value.toString() : value;

  numberValue = Number(match[1]);

  if (Number.isNaN(numberValue)) return value != null ? value.toString() : value;

  const suffix = match[2] || '';

  const formattedNumber = numberValue.toLocaleString(language, {
    minimumFractionDigits: digits ? digits.minimum : 0,
    maximumFractionDigits: digits ? digits.maximum : 1,
  });

  return `${formattedNumber}${suffix}`;
}
