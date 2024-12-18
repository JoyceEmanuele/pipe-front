const convertEnergy = (energyValue: number, energyThreshold = 10000): [number, 'kW' | 'MW'] => {
  if (energyValue > energyThreshold) return [energyValue / 1000, 'MW'];

  return [energyValue, 'kW'];
};

export { convertEnergy };
