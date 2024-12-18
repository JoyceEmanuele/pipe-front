export interface VersionNumber {
  vMajor: number;
  vMinor: number;
  vPatch: number;
}

const parseFwVersion = (version?: string | null): VersionNumber | undefined => {
  if (!version) return undefined;

  const [vMajor, vMinor, vPatch] = version.split('_');
  return {
    vMajor: Number(vMajor),
    vMinor: Number(vMinor),
    vPatch: Number(vPatch),
  };
};

export const isFwVersionGreatestOrEqual = (referenceVersion: string, devFwVersion: string): boolean => {
  if (!referenceVersion && !devFwVersion) return false;

  const devVersion = parseFwVersion(devFwVersion);
  const refVersion = parseFwVersion(referenceVersion);

  if (!devVersion || !refVersion) return false;

  if (devVersion.vMajor > refVersion.vMajor) return true;
  if (devVersion.vMajor < refVersion.vMajor) return false;

  if (devVersion.vMinor > refVersion.vMinor) return true;
  if (devVersion.vMinor < refVersion.vMinor) return false;

  if (devVersion.vPatch > refVersion.vPatch) return true;
  if (devVersion.vPatch < refVersion.vPatch) return false;

  return true; // Todas partes são iguais
};
