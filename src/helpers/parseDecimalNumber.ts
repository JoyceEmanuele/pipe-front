export default function parseDecimalNumber(numberStr: string) {
  if (!numberStr) return null;
  return Number(numberStr.replace(',', '.'));
}
