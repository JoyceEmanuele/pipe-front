export function rssiDescriptionParser(RSSI: number, status: string): string {
  if (RSSI < 0 && status === 'ONLINE') {
    if (RSSI > -50) return 'excelente';
    if (RSSI > -60) return 'bom';
    if (RSSI > -70) return 'regular';
    return 'ruim';
  }
  return '-';
}

export function verifyAndUpdateRSSI(payload: { data: { RSSI: number | null, status: string }}): string | undefined {
  if (payload.data.RSSI != null) {
    return rssiDescriptionParser(payload.data.RSSI, payload.data.status);
  }
}
