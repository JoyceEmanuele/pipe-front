export const getArrayDaysOfMonth = (mes: number, ano: number): number[] => {
  const data = new Date(ano, mes, 0);

  const numDias: number = data.getDate();

  const dias: number[] = Array.from({ length: numDias }, (_, i) => i + 1);

  return dias;
};
