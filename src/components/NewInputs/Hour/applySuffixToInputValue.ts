export const applySuffixToInputValue = (
  originalText: string,
  suffix: string,
  sanitizePattern: RegExp,
): string => {
  let newText = originalText;
  if (newText[newText.length - 1] === suffix[suffix.length - 2]) {
    if (newText.length === 1) {
      newText = '';
    } else {
      newText = newText.substring(0, newText.length - 2);
    }
  }
  let normalizedText = newText.replace(sanitizePattern, '');
  if (normalizedText.includes(suffix)) {
    normalizedText = normalizedText.replace(suffix, '') + suffix;
  } else if (normalizedText.length >= 1) {
    normalizedText += suffix;
  }
  return normalizedText;
};
