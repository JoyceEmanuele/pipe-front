type DutNofifs = {
    name: string;
    description: string;
  }

const listOfDutNotifs: DutNofifs[] = [
  { name: 'DUT<>DUT', description: 'TEMPERATURA DE AMBIENTES FORA DOS LIMITES' },
  { name: 'T>T', description: 'TEMPERATURA DO AMBIENTE ACIMA DO LIMITE' },
];

export function getDutNotifTemperature(dutName: string): boolean | undefined {
  const names = listOfDutNotifs.map((item) => item.name);
  if (names.includes(dutName)) {
    return true;
  }
}

export function getDutDescription(dutName: string): string {
  const dut = listOfDutNotifs.find(({ name }) => name === dutName);
  return dut!.description;
}
