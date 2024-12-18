export const cutText = (text: string, size: number): string => (text?.length > size ? `${text.slice(0, size)}...` : text);
