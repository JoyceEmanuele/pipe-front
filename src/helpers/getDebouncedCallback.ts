export function getDebouncedCallback(callback: (v: HTMLInputElement['value']) => void, delay: number) {
  const onInput = (e: InputEvent) => {
    clearTimeout(onInput.timer);
    onInput.value = (e.target as HTMLInputElement).value;
    onInput.timer = setTimeout(() => callback(onInput.value), delay);
  };
  onInput.timer = null;
  onInput.value = null;
  return onInput;
}
