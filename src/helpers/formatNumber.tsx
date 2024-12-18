export const formatNumber = (num: string | number): string => {
  let isNegative = false;
  let whole = num.toString().split('.')[0];
  const decimal = num.toString().split('.')[1];

  if (whole.startsWith('-')) {
    isNegative = true;
    whole = whole.slice(1);
  }

  whole = whole.split('').reverse().join('').replace(/(\d{3})/g, '$1.')
    .split('')
    .reverse()
    .join('');
  whole = whole.startsWith('.') ? whole.slice(1) : whole;

  if (isNegative) {
    whole = `-${whole}`;
  }

  return decimal ? `${whole},${decimal.substring(0, 2)}` : whole;
};
