type SetpointLimits = {
  min: number;
  max: number;
}

const PADDING_TICKS = 4;
const TOTAL_TICKS = 26;
const LIMIT_TOTAL_TICKS = 35;
export const LIMITS_SETPOINT = [-25, 100];

export function roundedTicks(ticks: number[], { min, max }: SetpointLimits): number[] {
  const firstTick = ticks[0];
  const lastTick = ticks[ticks.length - 1];
  const stepperSize = ticks[1] - firstTick;

  const minDifference = Math.max(min - firstTick, 0);
  const maxDifference = Math.max(lastTick - max, 0);
  const totalDifference = minDifference + maxDifference;

  if (Math.floor(totalDifference / stepperSize) > 1
    && firstTick > LIMITS_SETPOINT[0]
    && lastTick < LIMITS_SETPOINT[1]
  ) {
    const divideDifference = Math.floor(totalDifference / 2);
    const remainingDifference = totalDifference % 2;

    const minArray = Array.from({ length: divideDifference }, (_, index) => min - (divideDifference - index * stepperSize));
    const maxArray = Array.from({ length: divideDifference + remainingDifference }, (_, index) => (max + ((index + 1) * stepperSize)));

    const minIndex = ticks.findIndex((value) => value === min);
    const maxIndex = ticks.findIndex((value) => value === max);

    if (minIndex === -1 || maxIndex === -1) {
      return ticks;
    }

    const newRoundedTicks = [...minArray, ...ticks.slice(minIndex, maxIndex + 1), ...maxArray];
    return newRoundedTicks;
  }

  return ticks;
}

function addTicks(ticks: number[], length: number): number[] {
  const lastTick = ticks[ticks.length - 1];
  const newTicks = Array.from({ length }, (_, index) => lastTick + 1 + index);
  return [...ticks, ...newTicks];
}

export function generateTicks(min: number, stepper: number, totalTicks: number): number[] {
  const newTicks: number[] = [];

  for (let i = 0; i < totalTicks; i += 1) {
    newTicks.push(min + i * stepper);
  }

  return newTicks;
}

export function generateTicksByStepper(
  { min, max } : SetpointLimits,
  stepper: number,
  totalTicks: number,
): number[] {
  const auxMax = LIMITS_SETPOINT[1];
  let auxMin = LIMITS_SETPOINT[0];
  let ticks: number[] = [];
  const limitMinByStepper = auxMax - ((totalTicks - 1) * stepper);

  while (!(ticks.includes(min) && ticks.includes(max)) && auxMin <= limitMinByStepper) {
    ticks = generateTicks(auxMin, stepper, totalTicks);
    auxMin += stepper;
  }

  return ticks;
}

export function generateTicksByRange({ min, max }: SetpointLimits): number[] {
  let stepper = 1;
  let totalTicks = TOTAL_TICKS;
  let ticks: number[] = [];
  while ((!ticks.includes(min) || !ticks.includes(max)) && stepper <= 5) {
    ticks = generateTicksByStepper({ min, max }, stepper, totalTicks);
    totalTicks++;

    if (totalTicks > LIMIT_TOTAL_TICKS) {
      totalTicks = TOTAL_TICKS;
      stepper = 5;
    }
  }

  if (ticks[0] === min || ticks[ticks.length - 1] === max) {
    ticks = addTicks(ticks, PADDING_TICKS);
  }

  return roundedTicks(ticks, { min, max });
}
