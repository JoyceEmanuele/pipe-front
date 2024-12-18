export default function jsonTryParse<T>(asStr: string): T|null {
  if (!asStr) return null;
  try {
    return JSON.parse(asStr);
  } catch (err) {
    console.error(err);
    return null;
  }
}
