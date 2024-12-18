export function generateNameFormatted(name, subName) {
  if (name) {
    if (name.length > 30) {
      return `${name.substring(0, 30)}... - ${subName}`;
    }
    return `${name} - ${subName}`;
  }
  return `Celsius 360 - ${subName}`;
}
